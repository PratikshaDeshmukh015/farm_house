package com.example.demo.controller;

import com.example.demo.dto.ReceiptDTO;
import com.example.demo.service.ReceiptService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/receipts")
public class ReceiptController {

    @Autowired
    private ReceiptService receiptService;

    /**
     * Download / Stream PDF Receipt by Booking ID
     * GET /api/receipts/:bookingId
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<?> downloadReceipt(@PathVariable Long bookingId) {
        try {
            byte[] pdfBytes = receiptService.getReceiptPdfBytes(bookingId);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Receipt-Booking-" + bookingId + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * Download / Stream PDF Receipt by Receipt Number
     * GET /api/receipts/number/:receiptNumber
     */
    @GetMapping("/number/{receiptNumber}")
    public ResponseEntity<?> downloadReceiptByNumber(@PathVariable String receiptNumber) {
        try {
            byte[] pdfBytes = receiptService.getReceiptPdfBytesByNumber(receiptNumber);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + receiptNumber + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * Get Receipt Information (JSON)
     * GET /api/receipts/:bookingId/info
     */
    @GetMapping("/{bookingId}/info")
    public ResponseEntity<?> getReceiptInfo(@PathVariable Long bookingId) {
        try {
            ReceiptDTO receipt = receiptService.getReceiptDTO(bookingId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("receipt", receipt);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * Resend receipt email with attached PDF
     * POST /api/receipts/:bookingId/resend-email
     */
    @PostMapping("/{bookingId}/resend-email")
    public ResponseEntity<?> resendEmail(@PathVariable Long bookingId) {
        try {
            receiptService.resendEmail(bookingId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Receipt email resent successfully.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Send / Resend WhatsApp booking confirmation
     * POST /api/receipts/:bookingId/send-whatsapp
     */
    @PostMapping("/{bookingId}/send-whatsapp")
    public ResponseEntity<?> sendWhatsApp(@PathVariable Long bookingId) {
        try {
            receiptService.resendWhatsApp(bookingId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "WhatsApp confirmation sent successfully.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}
