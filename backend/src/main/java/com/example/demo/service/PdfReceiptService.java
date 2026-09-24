package com.example.demo.service;

import com.example.demo.entity.Booking;
import com.example.demo.entity.Payment;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

@Service
public class PdfReceiptService {

    @Autowired
    private TemplateEngine templateEngine;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    public byte[] generateReceiptPdf(Booking booking, Payment payment, String receiptNumber) {
        try {
            Context context = new Context();
            context.setVariable("receiptNumber", receiptNumber);
            context.setVariable("bookingNumber", "BK-" + booking.getId());
            context.setVariable("generatedDate", java.time.LocalDateTime.now().format(TIME_FORMATTER));

            // Customer details
            context.setVariable("customerName", booking.getUser() != null ? booking.getUser().getName() : "Guest Customer");
            context.setVariable("customerEmail", booking.getUser() != null ? booking.getUser().getEmail() : "N/A");
            context.setVariable("customerPhone", booking.getUser() != null && booking.getUser().getPhone() != null ? booking.getUser().getPhone() : "N/A");
            context.setVariable("numberOfGuests", booking.getNumberOfGuests() != null ? booking.getNumberOfGuests() : 1);

            // Farmhouse details
            String farmName = booking.getFarmHouse() != null ? booking.getFarmHouse().getName() : "Luxury Farmhouse";
            String farmLoc = booking.getFarmHouse() != null ? booking.getFarmHouse().getLocation() : "India";
            context.setVariable("farmHouseName", farmName);
            context.setVariable("farmHouseLocation", farmLoc);

            context.setVariable("checkInDate", booking.getStartDate() != null ? booking.getStartDate().format(DATE_FORMATTER) : "N/A");
            context.setVariable("checkOutDate", booking.getEndDate() != null ? booking.getEndDate().format(DATE_FORMATTER) : "N/A");
            context.setVariable("timeSlot", booking.getTimeSlot() != null ? booking.getTimeSlot().name() : "FULL_DAY");

            long days = 1;
            if (booking.getStartDate() != null && booking.getEndDate() != null) {
                days = Math.max(1, ChronoUnit.DAYS.between(booking.getStartDate(), booking.getEndDate()));
            }
            context.setVariable("totalDays", days);

            // Payment details
            double total = booking.getTotalPrice() != null ? booking.getTotalPrice() : 0.0;
            context.setVariable("basePrice", String.format("%,.2f", total));
            context.setVariable("totalAmount", String.format("%,.2f", total));
            context.setVariable("paymentId", payment != null && payment.getPaymentId() != null ? payment.getPaymentId() : (payment != null && payment.getTransactionId() != null ? payment.getTransactionId() : "N/A"));
            context.setVariable("gateway", payment != null && payment.getGateway() != null ? payment.getGateway() : "Razorpay");

            // Process HTML with Thymeleaf
            String renderedHtml = templateEngine.process("receipt", context);

            // Generate PDF from HTML
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(renderedHtml, null);
            builder.toStream(outputStream);
            builder.run();

            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF receipt: " + e.getMessage(), e);
        }
    }
}
