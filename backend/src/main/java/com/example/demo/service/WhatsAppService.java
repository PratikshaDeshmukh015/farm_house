package com.example.demo.service;

import com.example.demo.entity.Booking;
import com.example.demo.entity.NotificationLog;
import com.example.demo.entity.User;
import com.example.demo.repository.NotificationLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class WhatsAppService {

    private static final Logger log = LoggerFactory.getLogger(WhatsAppService.class);

    @Value("${whatsapp.phone-number-id:}")
    private String phoneNumberId;

    @Value("${whatsapp.access-token:}")
    private String accessToken;

    @Value("${server.port:8081}")
    private String serverPort;

    @Autowired(required = false)
    private NotificationLogRepository notificationLogRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Send WhatsApp confirmation message for a confirmed booking
     */
    public boolean sendBookingConfirmation(User user, Booking booking, String receiptNumber) {
        String phone = (user != null && user.getPhone() != null && !user.getPhone().isBlank()) 
                ? user.getPhone() 
                : "N/A";

        if ("N/A".equals(phone)) {
            log.info("No phone number provided for user {}; skipping WhatsApp notification.", user != null ? user.getName() : "Unknown");
            return false;
        }

        // Clean phone number (remove +, spaces, dashes)
        String cleanPhone = phone.replaceAll("[^0-9]", "");
        if (cleanPhone.length() == 10) {
            cleanPhone = "91" + cleanPhone; // Default to India country code if 10 digits
        }

        String farmName = booking.getFarmHouse() != null ? booking.getFarmHouse().getName() : "Farmhouse";
        String messageBody = String.format(
            "Hello %s 🌿\n\n" +
            "Your farmhouse booking has been CONFIRMED! ✅\n\n" +
            "📋 *Receipt No:* %s\n" +
            "🏡 *Property:* %s\n" +
            "📅 *Check-in:* %s\n" +
            "📅 *Check-out:* %s\n" +
            "👥 *Guests:* %s\n" +
            "💰 *Amount Paid:* ₹%.2f\n\n" +
            "🔗 *Download Receipt:* http://localhost:%s/api/receipts/%d\n\n" +
            "Thank you for choosing FarmHouse Stays! Have a wonderful stay ✨",
            user.getName(),
            receiptNumber,
            farmName,
            booking.getStartDate(),
            booking.getEndDate(),
            booking.getNumberOfGuests() != null ? booking.getNumberOfGuests() : 1,
            booking.getTotalPrice() != null ? booking.getTotalPrice() : 0.0,
            serverPort,
            booking.getId()
        );

        // If Cloud API credentials are provided, call Meta WhatsApp Cloud API
        if (phoneNumberId != null && !phoneNumberId.isBlank() && accessToken != null && !accessToken.isBlank()) {
            try {
                String url = "https://graph.facebook.com/v18.0/" + phoneNumberId + "/messages";

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(accessToken);

                Map<String, Object> textObj = new HashMap<>();
                textObj.put("body", messageBody);

                Map<String, Object> payload = new HashMap<>();
                payload.put("messaging_product", "whatsapp");
                payload.put("recipient_type", "individual");
                payload.put("to", cleanPhone);
                payload.put("type", "text");
                payload.put("text", textObj);

                HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
                restTemplate.postForEntity(url, request, String.class);

                log.info("WhatsApp message dispatched via Meta Cloud API to: {}", cleanPhone);
                logNotification(booking, cleanPhone, "SENT", "Cloud API message sent", null);
                return true;
            } catch (Exception e) {
                log.warn("Failed to dispatch WhatsApp message via Meta API: {}", e.getMessage());
                logNotification(booking, cleanPhone, "FAILED", null, e.getMessage());
                return false;
            }
        }

        // Development / simulation fallback
        log.info("[WhatsApp Simulation] To: {} | Content:\n{}", cleanPhone, messageBody);
        logNotification(booking, cleanPhone, "SENT", "Simulated WhatsApp message (Add WhatsApp Cloud API keys in application.properties for live messages)", null);
        return true;
    }

    private void logNotification(Booking booking, String recipient, String status, String msgId, String error) {
        if (notificationLogRepository != null && booking != null) {
            try {
                NotificationLog nlog = new NotificationLog();
                nlog.setBooking(booking);
                nlog.setType("WHATSAPP");
                nlog.setRecipient(recipient);
                nlog.setStatus(status);
                nlog.setMessageId(msgId);
                nlog.setErrorMessage(error);
                nlog.setSentAt(LocalDateTime.now());
                notificationLogRepository.save(nlog);
            } catch (Exception ex) {
                log.debug("Failed to record WhatsApp notification log: {}", ex.getMessage());
            }
        }
    }
}
