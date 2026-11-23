package com.example.demo.controller;

import com.example.demo.dto.DiscountDTO;
import com.example.demo.service.DiscountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/discounts")
public class DiscountController {

    @Autowired
    private DiscountService discountService;

    private ResponseEntity<Map<String, Object>> errorResponse(Exception exception, HttpStatus status) {
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("message", exception.getMessage());
        return ResponseEntity.status(status).body(error);
    }

    private HttpStatus statusFor(Exception exception, HttpStatus fallback) {
        return exception instanceof AccessDeniedException ? HttpStatus.FORBIDDEN : fallback;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // PUBLIC — Homepage
    // GET /api/discounts/active
    // ──────────────────────────────────────────────────────────────────────────
    @GetMapping("/active")
    public ResponseEntity<?> getActiveDiscounts() {
        try {
            List<DiscountDTO> discounts = discountService.getAllActiveDiscounts();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("discounts", discounts);
            response.put("count", discounts.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // ADMIN — All discounts
    // GET /api/discounts
    // Header: requester-id (must be ADMIN or SUPERADMIN)
    // ──────────────────────────────────────────────────────────────────────────
    // ──────────────────────────────────────────────────────────────────────────
    // ADMIN — All discounts
    // GET /api/discounts
    // Header: requester-id (must be ADMIN or SUPERADMIN)
    // ──────────────────────────────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<?> getAllDiscounts(
            @RequestHeader(value = "requester-id", required = false) Long requesterId) {
        try {
            if (requesterId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "User authorization header (requester-id) is required"));
            }
            List<DiscountDTO> discounts = discountService.getAllDiscounts(requesterId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("discounts", discounts);
            response.put("count", discounts.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return errorResponse(e, statusFor(e, HttpStatus.BAD_REQUEST));
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // OWNER — Their own discounts
    // GET /api/discounts/owner/{ownerId}
    // Header: requester-id
    // ──────────────────────────────────────────────────────────────────────────
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<?> getDiscountsByOwner(
            @PathVariable Long ownerId,
            @RequestHeader(value = "requester-id", required = false) Long requesterId) {
        try {
            Long reqId = requesterId != null ? requesterId : ownerId;
            List<DiscountDTO> discounts = discountService.getDiscountsByOwner(ownerId, reqId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("discounts", discounts);
            response.put("count", discounts.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return errorResponse(e, statusFor(e, HttpStatus.BAD_REQUEST));
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // CREATE
    // POST /api/discounts
    // Header: requester-id (OWNER / ADMIN / SUPERADMIN)
    // ──────────────────────────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<?> createDiscount(
            @RequestBody DiscountDTO discountDTO,
            @RequestHeader(value = "requester-id", required = false) Long requesterId) {
        try {
            Long reqId = requesterId != null ? requesterId : discountDTO.getCreatedById();
            if (reqId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "User authorization header (requester-id) is required"));
            }
            DiscountDTO created = discountService.createDiscount(discountDTO, reqId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Discount created successfully");
            response.put("discount", created);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return errorResponse(e, statusFor(e, HttpStatus.BAD_REQUEST));
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // UPDATE
    // PUT /api/discounts/{id}
    // Header: requester-id
    // ──────────────────────────────────────────────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDiscount(
            @PathVariable Long id,
            @RequestBody DiscountDTO discountDTO,
            @RequestHeader(value = "requester-id", required = false) Long requesterId) {
        try {
            Long reqId = requesterId != null ? requesterId : discountDTO.getCreatedById();
            if (reqId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "User authorization header (requester-id) is required"));
            }
            DiscountDTO updated = discountService.updateDiscount(id, discountDTO, reqId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Discount updated successfully");
            response.put("discount", updated);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return errorResponse(e, statusFor(e, HttpStatus.BAD_REQUEST));
        }
    }

    // ──────────────────────────────────────────────────────────────────────────
    // DELETE
    // DELETE /api/discounts/{id}
    // Header: requester-id
    // ──────────────────────────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDiscount(
            @PathVariable Long id,
            @RequestHeader(value = "requester-id", required = false) Long requesterId) {
        try {
            if (requesterId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("success", false, "message", "User authorization header (requester-id) is required"));
            }
            discountService.deleteDiscount(id, requesterId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Discount deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return errorResponse(e, statusFor(e, HttpStatus.BAD_REQUEST));
        }
    }
}
