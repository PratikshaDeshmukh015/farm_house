package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReceiptDTO {
    private Long id;
    private Long bookingId;
    private String receiptNumber;
    private String farmHouseName;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private Double totalAmount;
    private String paymentId;
    private String paymentStatus;
    private LocalDateTime generatedAt;
    private String pdfDownloadUrl;
}
