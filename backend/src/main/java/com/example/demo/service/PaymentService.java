package com.example.demo.service;

import com.example.demo.dto.PaymentDTO;
import com.example.demo.dto.PaymentOrderRequest;
import com.example.demo.dto.PaymentOrderResponse;
import com.example.demo.dto.PaymentVerifyRequest;
import com.example.demo.entity.Booking;
import com.example.demo.entity.Payment;
import com.example.demo.repository.BookingRepository;
import com.example.demo.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private RazorpayService razorpayService;

    @Autowired
    private ReceiptService receiptService;

    /**
     * Create Razorpay / Payment Gateway Order
     */
    public PaymentOrderResponse createPaymentOrder(PaymentOrderRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + request.getBookingId()));

        if (booking.getStatus() == Booking.BookingStatus.CONFIRMED) {
            throw new RuntimeException("Booking is already confirmed and paid for.");
        }

        Double totalAmount = booking.getTotalPrice();
        if (totalAmount == null || totalAmount <= 0) {
            throw new RuntimeException("Invalid booking amount: " + totalAmount);
        }

        // Create or find payment entity
        Payment payment = paymentRepository.findByBooking(booking).orElse(new Payment());
        payment.setBooking(booking);
        payment.setAmount(totalAmount);
        payment.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "RAZORPAY");
        payment.setGateway("RAZORPAY");
        payment.setPaymentStatus(Payment.PaymentStatus.PENDING);

        if (payment.getTransactionId() == null) {
            payment.setTransactionId(generateTransactionId());
        }

        // Create Order via Razorpay
        String orderId = razorpayService.createOrder(booking.getId(), totalAmount, "rcpt_" + booking.getId());
        payment.setOrderId(orderId);

        paymentRepository.save(payment);

        PaymentOrderResponse response = new PaymentOrderResponse();
        response.setBookingId(booking.getId());
        response.setOrderId(orderId);
        response.setAmount(totalAmount);
        response.setAmountInPaise(Math.round(totalAmount * 100));
        response.setCurrency("INR");
        response.setKeyId(razorpayService.getKeyId());
        response.setStatus("CREATED");

        if (booking.getUser() != null) {
            response.setCustomerName(booking.getUser().getName());
            response.setCustomerEmail(booking.getUser().getEmail());
            response.setCustomerPhone(booking.getUser().getPhone());
        }

        return response;
    }

    /**
     * Verify Razorpay Payment Signature, confirm booking, and generate receipt
     */
    public PaymentDTO verifyPayment(PaymentVerifyRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + request.getBookingId()));

        Payment payment = paymentRepository.findByBooking(booking)
                .orElseThrow(() -> new RuntimeException("No payment found for booking id: " + request.getBookingId()));

        // Verify HMAC-SHA256 signature
        boolean isValid = razorpayService.verifySignature(request.getOrderId(), request.getPaymentId(), request.getSignature());

        if (!isValid) {
            payment.setPaymentStatus(Payment.PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw new RuntimeException("Payment signature verification failed. Invalid payment.");
        }

        // Update Payment to SUCCESS
        payment.setPaymentStatus(Payment.PaymentStatus.SUCCESS);
        payment.setOrderId(request.getOrderId());
        payment.setPaymentId(request.getPaymentId());
        payment.setSignature(request.getSignature());
        payment.setPaidAt(LocalDateTime.now());
        Payment savedPayment = paymentRepository.save(payment);

        // Confirm Booking Status
        bookingService.confirmBooking(booking.getId());

        // Generate PDF Receipt and trigger Email + WhatsApp
        try {
            receiptService.generateAndDispatchReceipt(booking, savedPayment);
        } catch (Exception e) {
            log.error("Receipt generation / dispatch error after payment: {}", e.getMessage());
        }

        return convertToDTO(savedPayment);
    }

    /**
     * Create payment for booking (legacy / direct method)
     */
    public PaymentDTO createPayment(Long bookingId, String paymentMethod) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Optional<Payment> existingPayment = paymentRepository.findByBooking(booking);
        if (existingPayment.isPresent()) {
            Payment p = existingPayment.get();
            if (p.getPaymentStatus() == Payment.PaymentStatus.SUCCESS) {
                throw new RuntimeException("Payment already completed for this booking");
            }
        }

        Payment payment = existingPayment.orElse(new Payment());
        payment.setBooking(booking);
        payment.setAmount(booking.getTotalPrice());
        payment.setPaymentMethod(paymentMethod);
        payment.setPaymentStatus(Payment.PaymentStatus.PENDING);
        if (payment.getTransactionId() == null) {
            payment.setTransactionId(generateTransactionId());
        }

        Payment savedPayment = paymentRepository.save(payment);
        return convertToDTO(savedPayment);
    }

    /**
     * Process simulated payment
     */
    public PaymentDTO processPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setPaymentStatus(Payment.PaymentStatus.SUCCESS);
        payment.setPaidAt(LocalDateTime.now());
        if (payment.getPaymentId() == null) {
            payment.setPaymentId("pay_sim_" + UUID.randomUUID().toString().substring(0, 8));
        }
        Payment processedPayment = paymentRepository.save(payment);

        // Confirm booking
        bookingService.confirmBooking(payment.getBooking().getId());

        // Generate receipt
        try {
            receiptService.generateAndDispatchReceipt(payment.getBooking(), processedPayment);
        } catch (Exception e) {
            log.warn("Could not dispatch receipt: {}", e.getMessage());
        }

        return convertToDTO(processedPayment);
    }

    public PaymentDTO getPaymentById(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return convertToDTO(payment);
    }

    public PaymentDTO getPaymentByBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Payment payment = paymentRepository.findByBooking(booking)
                .orElseThrow(() -> new RuntimeException("Payment not found for this booking"));
        return convertToDTO(payment);
    }

    public List<PaymentDTO> getAllPayments() {
        return paymentRepository.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<PaymentDTO> getPaymentsByStatus(String status) {
        List<Payment> payments = paymentRepository.findByPaymentStatus(
                Payment.PaymentStatus.valueOf(status.toUpperCase())
        );
        return payments.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public PaymentDTO refundPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getPaymentStatus() != Payment.PaymentStatus.SUCCESS) {
            throw new RuntimeException("Only successful payments can be refunded");
        }

        payment.setPaymentStatus(Payment.PaymentStatus.REFUNDED);
        Payment refundedPayment = paymentRepository.save(payment);

        bookingService.cancelBooking(payment.getBooking().getId());
        return convertToDTO(refundedPayment);
    }

    private String generateTransactionId() {
        return "TXN_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private PaymentDTO convertToDTO(Payment payment) {
        PaymentDTO dto = new PaymentDTO();
        dto.setId(payment.getId());
        dto.setBookingId(payment.getBooking().getId());
        dto.setAmount(payment.getAmount());
        dto.setPaymentStatus(payment.getPaymentStatus().toString());
        dto.setTransactionId(payment.getTransactionId());
        dto.setPaymentMethod(payment.getPaymentMethod());
        dto.setGateway(payment.getGateway());
        dto.setOrderId(payment.getOrderId());
        dto.setPaymentId(payment.getPaymentId());
        dto.setSignature(payment.getSignature());
        dto.setPaidAt(payment.getPaidAt());
        return dto;
    }
}
