package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOrderResponse {
    private Long bookingId;
    private String orderId;
    private Double amount; // In INR
    private Long amountInPaise;
    private String currency;
    private String keyId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String status;
}
