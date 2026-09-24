package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOrderRequest {
    private Long bookingId;
    private String paymentMethod; // RAZORPAY, CARD, UPI, SIMULATED
}
