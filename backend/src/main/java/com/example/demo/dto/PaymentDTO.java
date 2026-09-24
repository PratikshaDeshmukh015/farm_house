package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDTO {
    private Long id;
    private Long bookingId;
    private Double amount;
    private String paymentStatus;
    private String transactionId;
    private String paymentMethod;
    private String gateway;
    private String orderId;
    private String paymentId;
    private String signature;
    private LocalDateTime paidAt;
}
