package com.example.demo.controller;

import com.example.demo.dto.BookingDTO;
import com.example.demo.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    
    @Autowired
    private BookingService bookingService;
    
    /**
     * Create new booking
     * POST /api/bookings
     * Headers: user-id
     */
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingDTO bookingDTO,
                                          @RequestHeader("user-id") Long userId) {
        try {
            BookingDTO newBooking = bookingService.createBooking(bookingDTO, userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Booking created successfully");
            response.put("booking", newBooking);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    /**
     * Get booking by ID
     * GET /api/bookings/:id
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable Long id) {
        try {
            BookingDTO booking = bookingService.getBookingById(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("booking", booking);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    /**
     * Get all bookings (Admin only)
     * GET /api/bookings
     */
    @GetMapping
    public ResponseEntity<?> getAllBookings() {
        try {
            List<BookingDTO> bookings = bookingService.getAllBookings();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("bookings", bookings);
            response.put("count", bookings.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Get user's bookings
     * GET /api/bookings/user/:userId
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserBookings(@PathVariable Long userId) {
        try {
            List<BookingDTO> bookings = bookingService.getBookingsByUser(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("bookings", bookings);
            response.put("count", bookings.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    /**
     * Get farm house bookings
     * GET /api/bookings/farmhouse/:farmHouseId
     */
    @GetMapping("/farmhouse/{farmHouseId}")
    public ResponseEntity<?> getFarmHouseBookings(@PathVariable Long farmHouseId) {
        try {
            List<BookingDTO> bookings = bookingService.getBookingsByFarmHouse(farmHouseId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("bookings", bookings);
            response.put("count", bookings.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    /**
     * Confirm booking (after payment)
     * PUT /api/bookings/:id/confirm
     */
    @PutMapping("/{id}/confirm")
    public ResponseEntity<?> confirmBooking(@PathVariable Long id) {
        try {
            BookingDTO confirmedBooking = bookingService.confirmBooking(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Booking confirmed successfully");
            response.put("booking", confirmedBooking);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    /**
     * Cancel booking
     * PUT /api/bookings/:id/cancel
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        try {
            BookingDTO cancelledBooking = bookingService.cancelBooking(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Booking cancelled successfully");
            response.put("booking", cancelledBooking);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    /**
     * Check availability
     * GET /api/bookings/check/availability?farmHouseId=1&startDate=2024-05-01&endDate=2024-05-05
     */
    @GetMapping("/check/availability")
    public ResponseEntity<?> checkAvailability(
            @RequestParam Long farmHouseId,
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(defaultValue = "AM") String timeSlot) {
        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            
            boolean available = bookingService.isAvailable(farmHouseId, start, end, timeSlot);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("available", available);
            response.put("farmHouseId", farmHouseId);
            response.put("startDate", startDate);
            response.put("endDate", endDate);
            response.put("timeSlot", timeSlot.toUpperCase());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    /**
     * Delete booking
     * DELETE /api/bookings/:id
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBooking(@PathVariable Long id) {
        try {
            bookingService.cancelBooking(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Booking deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
