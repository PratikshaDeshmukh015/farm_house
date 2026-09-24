package com.example.demo.service;

import com.example.demo.entity.Booking;
import com.example.demo.entity.NotificationLog;
import com.example.demo.entity.User;
import com.example.demo.repository.NotificationLogRepository;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Autowired(required = false)
    private NotificationLogRepository notificationLogRepository;

    /**
     * Send simple booking notification
     */
    public void sendBookingConfirmationEmail(User user, Booking booking) {
        if (user == null || user.getEmail() == null || user.getEmail().isBlank()) {
            return;
        }

        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(user.getEmail());
            mailMessage.setSubject("FarmHouse Booking Created - Ref #" + booking.getId());
            mailMessage.setText(buildBookingMessage(user, booking));

            mailSender.send(mailMessage);
            logNotification(booking, user.getEmail(), "SENT", "Booking initial email sent", null);
        } catch (Exception e) {
            log.warn("Could not send booking creation email: {}", e.getMessage());
            logNotification(booking, user.getEmail(), "FAILED", null, e.getMessage());
        }
    }

    /**
     * Send official receipt PDF email on confirmed payment
     */
    public void sendReceiptEmail(User user, Booking booking, byte[] pdfBytes, String receiptNumber) {
        if (user == null || user.getEmail() == null || user.getEmail().isBlank()) {
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(user.getEmail());
            helper.setSubject("🏡 Booking Confirmed & Receipt Attached - " + receiptNumber);

            String htmlBody = String.format(
                "<div style='font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto;'>" +
                "<h2 style='color: #166534;'>🎉 Your Farmhouse Booking is Confirmed!</h2>" +
                "<p>Dear <strong>%s</strong>,</p>" +
                "<p>Thank you for choosing <strong>FarmHouse Stays</strong>. Your payment of <strong>₹%.2f</strong> has been successfully processed.</p>" +
                "<div style='background-color: #f8fafc; border-left: 4px solid #16a34a; padding: 12px 16px; margin: 16px 0;'>" +
                "<p style='margin: 4px 0;'><strong>Receipt No:</strong> %s</p>" +
                "<p style='margin: 4px 0;'><strong>Property:</strong> %s</p>" +
                "<p style='margin: 4px 0;'><strong>Check-in:</strong> %s</p>" +
                "<p style='margin: 4px 0;'><strong>Check-out:</strong> %s</p>" +
                "</div>" +
                "<p>Your official PDF booking receipt is attached to this email. Please carry a copy (digital or printed) during check-in.</p>" +
                "<p style='margin-top: 24px;'>Warm regards,<br /><strong>FarmHouse Team</strong></p>" +
                "</div>",
                user.getName(),
                booking.getTotalPrice() != null ? booking.getTotalPrice() : 0.0,
                receiptNumber,
                booking.getFarmHouse() != null ? booking.getFarmHouse().getName() : "Farmhouse",
                booking.getStartDate(),
                booking.getEndDate()
            );

            helper.setText(htmlBody, true);

            if (pdfBytes != null && pdfBytes.length > 0) {
                helper.addAttachment(
                    "Receipt-" + receiptNumber + ".pdf",
                    new ByteArrayResource(pdfBytes),
                    "application/pdf"
                );
            }

            mailSender.send(message);
            log.info("Sent confirmation receipt email to: {} for booking: {}", user.getEmail(), booking.getId());
            logNotification(booking, user.getEmail(), "SENT", "Receipt PDF email sent", null);
        } catch (Exception e) {
            log.warn("Could not send receipt PDF email to {}: {}", user.getEmail(), e.getMessage());
            logNotification(booking, user.getEmail(), "FAILED", null, e.getMessage());
        }
    }

    private void logNotification(Booking booking, String recipient, String status, String msgId, String error) {
        if (notificationLogRepository != null && booking != null) {
            try {
                NotificationLog nlog = new NotificationLog();
                nlog.setBooking(booking);
                nlog.setType("EMAIL");
                nlog.setRecipient(recipient);
                nlog.setStatus(status);
                nlog.setMessageId(msgId);
                nlog.setErrorMessage(error);
                nlog.setSentAt(LocalDateTime.now());
                notificationLogRepository.save(nlog);
            } catch (Exception ex) {
                log.debug("Failed to record notification log: {}", ex.getMessage());
            }
        }
    }

    private String buildBookingMessage(User user, Booking booking) {
        return String.format(
                "Hello %s,\n\n" +
                "Thank you for booking with FarmHouse. Your booking has been created and is currently pending confirmation.\n\n" +
                "Booking details:\n" +
                "FarmHouse: %s\n" +
                "Check-in: %s\n" +
                "Check-out: %s\n" +
                "Guests: %s\n" +
                "Total price: ₹%.2f\n\n" +
                "Warm regards,\n" +
                "FarmHouse Booking Team",
                user.getName(),
                booking.getFarmHouse() != null ? booking.getFarmHouse().getName() : "Farmhouse",
                booking.getStartDate(),
                booking.getEndDate(),
                booking.getNumberOfGuests() == null ? "N/A" : booking.getNumberOfGuests(),
                booking.getTotalPrice() != null ? booking.getTotalPrice() : 0.0
        );
    }
}
