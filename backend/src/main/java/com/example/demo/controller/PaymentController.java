package com.example.demo.controller;

import com.example.demo.dto.PaymentDTO;
import com.example.demo.dto.PaymentOrderRequest;
import com.example.demo.dto.PaymentOrderResponse;
import com.example.demo.dto.PaymentVerifyRequest;
import com.example.demo.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {
    
    @Autowired
    private PaymentService paymentService;

    /**
     * Create Razorpay / Payment Order
     * POST /api/payments/create-order
     */
    @PostMapping("/create-order")
    public ResponseEntity<?> createPaymentOrder(@RequestBody PaymentOrderRequest request) {
        try {
            PaymentOrderResponse orderResponse = paymentService.createPaymentOrder(request);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment order created successfully");
            response.put("data", orderResponse);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Verify Razorpay Payment Signature, confirm booking, and send Receipt PDF & WhatsApp
     * POST /api/payments/verify
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerifyRequest request) {
        try {
            PaymentDTO payment = paymentService.verifyPayment(request);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment verified successfully. Booking confirmed and receipt dispatched.");
            response.put("payment", payment);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    /**
     * Create payment for booking (legacy)
     * POST /api/payments
     */
    @PostMapping
    public ResponseEntity<?> createPayment(@RequestBody Map<String, Object> request) {
        try {
            Long bookingId = Long.parseLong(request.get("bookingId").toString());
            String paymentMethod = (String) request.get("paymentMethod");
            
            PaymentDTO payment = paymentService.createPayment(bookingId, paymentMethod);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment created successfully");
            response.put("payment", payment);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    /**
     * Process simulated payment
     * POST /api/payments/:id/process
     */
    @PostMapping("/{id}/process")
    public ResponseEntity<?> processPayment(@PathVariable Long id) {
        try {
            PaymentDTO payment = paymentService.processPayment(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment processed successfully");
            response.put("payment", payment);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    /**
     * Get payment by ID
     * GET /api/payments/:id
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getPaymentById(@PathVariable Long id) {
        try {
            PaymentDTO payment = paymentService.getPaymentById(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("payment", payment);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    /**
     * Get payment by booking
     * GET /api/payments/booking/:bookingId
     */
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<?> getPaymentByBooking(@PathVariable Long bookingId) {
        try {
            PaymentDTO payment = paymentService.getPaymentByBooking(bookingId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("payment", payment);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    /**
     * Get all payments
     * GET /api/payments
     */
    @GetMapping
    public ResponseEntity<?> getAllPayments() {
        try {
            List<PaymentDTO> payments = paymentService.getAllPayments();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("payments", payments);
            response.put("count", payments.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Get payments by status
     * GET /api/payments/status/:status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getPaymentsByStatus(@PathVariable String status) {
        try {
            List<PaymentDTO> payments = paymentService.getPaymentsByStatus(status);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("payments", payments);
            response.put("count", payments.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    /**
     * Refund payment
     * POST /api/payments/:id/refund
     */
    @PostMapping("/{id}/refund")
    public ResponseEntity<?> refundPayment(@PathVariable Long id) {
        try {
            PaymentDTO payment = paymentService.refundPayment(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Payment refunded successfully");
            response.put("payment", payment);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}
