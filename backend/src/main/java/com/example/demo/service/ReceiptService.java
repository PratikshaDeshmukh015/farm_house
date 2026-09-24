package com.example.demo.service;

import com.example.demo.dto.ReceiptDTO;
import com.example.demo.entity.Booking;
import com.example.demo.entity.Payment;
import com.example.demo.entity.Receipt;
import com.example.demo.repository.BookingRepository;
import com.example.demo.repository.PaymentRepository;
import com.example.demo.repository.ReceiptRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ReceiptService {

    private static final Logger log = LoggerFactory.getLogger(ReceiptService.class);

    @Autowired
    private ReceiptRepository receiptRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PdfReceiptService pdfReceiptService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private WhatsAppService whatsappService;

    @Value("${receipt.storage.path:receipts/}")
    private String receiptStoragePath;

    /**
     * Generates receipt entity, renders PDF, and triggers Email and WhatsApp dispatches.
     */
    public Receipt generateAndDispatchReceipt(Booking booking, Payment payment) {
        if (booking == null) {
            throw new RuntimeException("Cannot generate receipt for null booking");
        }

        // Check if receipt already exists
        Optional<Receipt> existing = receiptRepository.findByBooking(booking);
        if (existing.isPresent()) {
            return existing.get();
        }

        String receiptNumber = generateReceiptNumber(booking.getId());

        // Generate PDF bytes
        byte[] pdfBytes = pdfReceiptService.generateReceiptPdf(booking, payment, receiptNumber);

        // Optionally save to disk
        String savedPath = null;
        try {
            File dir = new File(receiptStoragePath);
            if (!dir.exists()) {
                dir.mkdirs();
            }
            File pdfFile = new File(dir, "Receipt-" + receiptNumber + ".pdf");
            try (FileOutputStream fos = new FileOutputStream(pdfFile)) {
                fos.write(pdfBytes);
            }
            savedPath = pdfFile.getAbsolutePath();
        } catch (Exception e) {
            log.warn("Could not write receipt PDF to disk: {}", e.getMessage());
        }

        // Save Receipt entity
        Receipt receipt = new Receipt();
        receipt.setBooking(booking);
        receipt.setReceiptNumber(receiptNumber);
        receipt.setPdfPath(savedPath);
        receipt.setGeneratedAt(LocalDateTime.now());

        Receipt savedReceipt = receiptRepository.save(receipt);

        // Asynchronously or safely trigger Email with PDF attached
        if (booking.getUser() != null) {
            try {
                emailService.sendReceiptEmail(booking.getUser(), booking, pdfBytes, receiptNumber);
            } catch (Exception e) {
                log.warn("Email dispatch failed: {}", e.getMessage());
            }

            // Trigger WhatsApp confirmation
            try {
                whatsappService.sendBookingConfirmation(booking.getUser(), booking, receiptNumber);
            } catch (Exception e) {
                log.warn("WhatsApp dispatch failed: {}", e.getMessage());
            }
        }

        return savedReceipt;
    }

    /**
     * Get PDF bytes for a booking ID
     */
    public byte[] getReceiptPdfBytes(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        Payment payment = paymentRepository.findByBooking(booking).orElse(null);

        Receipt receipt = receiptRepository.findByBooking(booking)
                .orElseGet(() -> generateAndDispatchReceipt(booking, payment));

        return pdfReceiptService.generateReceiptPdf(booking, payment, receipt.getReceiptNumber());
    }

    /**
     * Get PDF bytes by receipt number
     */
    public byte[] getReceiptPdfBytesByNumber(String receiptNumber) {
        Receipt receipt = receiptRepository.findByReceiptNumber(receiptNumber)
                .orElseThrow(() -> new RuntimeException("Receipt not found with number: " + receiptNumber));

        Booking booking = receipt.getBooking();
        Payment payment = paymentRepository.findByBooking(booking).orElse(null);

        return pdfReceiptService.generateReceiptPdf(booking, payment, receipt.getReceiptNumber());
    }

    /**
     * Convert Receipt to DTO
     */
    public ReceiptDTO getReceiptDTO(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        Receipt receipt = receiptRepository.findByBooking(booking)
                .orElseThrow(() -> new RuntimeException("Receipt not found for booking: " + bookingId));

        Payment payment = paymentRepository.findByBooking(booking).orElse(null);

        ReceiptDTO dto = new ReceiptDTO();
        dto.setId(receipt.getId());
        dto.setBookingId(booking.getId());
        dto.setReceiptNumber(receipt.getReceiptNumber());
        dto.setFarmHouseName(booking.getFarmHouse() != null ? booking.getFarmHouse().getName() : "Farmhouse");
        dto.setCustomerName(booking.getUser() != null ? booking.getUser().getName() : "Guest");
        dto.setCustomerEmail(booking.getUser() != null ? booking.getUser().getEmail() : "N/A");
        dto.setCustomerPhone(booking.getUser() != null ? booking.getUser().getPhone() : "N/A");
        dto.setTotalAmount(booking.getTotalPrice());
        dto.setPaymentId(payment != null ? payment.getPaymentId() : "N/A");
        dto.setPaymentStatus(payment != null ? payment.getPaymentStatus().name() : "PENDING");
        dto.setGeneratedAt(receipt.getGeneratedAt());
        dto.setPdfDownloadUrl("/api/receipts/" + booking.getId());

        return dto;
    }

    /**
     * Re-send email with PDF
     */
    public boolean resendEmail(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        Payment payment = paymentRepository.findByBooking(booking).orElse(null);
        Receipt receipt = receiptRepository.findByBooking(booking)
                .orElseGet(() -> generateAndDispatchReceipt(booking, payment));

        byte[] pdfBytes = pdfReceiptService.generateReceiptPdf(booking, payment, receipt.getReceiptNumber());
        emailService.sendReceiptEmail(booking.getUser(), booking, pdfBytes, receipt.getReceiptNumber());
        return true;
    }

    /**
     * Re-send WhatsApp confirmation
     */
    public boolean resendWhatsApp(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));

        Receipt receipt = receiptRepository.findByBooking(booking)
                .orElseThrow(() -> new RuntimeException("Receipt not found for booking: " + bookingId));

        return whatsappService.sendBookingConfirmation(booking.getUser(), booking, receipt.getReceiptNumber());
    }

    private String generateReceiptNumber(Long bookingId) {
        int year = LocalDate.now().getYear();
        return String.format("REC-%d-%05d", year, bookingId != null ? bookingId : 1);
    }
}
