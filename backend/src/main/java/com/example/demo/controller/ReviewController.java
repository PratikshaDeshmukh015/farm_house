package com.example.demo.controller;

import com.example.demo.dto.CreateReviewDTO;
import com.example.demo.dto.ReviewDTO;
import com.example.demo.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/farmhouse/{id}")
    public ResponseEntity<Map<String, Object>> getReviewsForFarmHouse(@PathVariable Long id) {
        List<ReviewDTO> reviews = reviewService.getReviewsForFarmHouse(id);
        return ResponseEntity.ok(Map.of("success", true, "reviews", reviews));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createReview(@RequestHeader("user-id") Long userId,
                                                            @RequestBody CreateReviewDTO createReviewDTO) {
        try {
            ReviewDTO review = reviewService.createReview(userId, createReviewDTO);
            return ResponseEntity.ok(Map.of("success", true, "review", review, "message", "Review added successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
