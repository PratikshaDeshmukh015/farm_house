package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "farmhouses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FarmHouse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String location;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private Double pricePerDay;
    
    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;
    
    @Column(columnDefinition = "boolean default true")
    private Boolean available = true;
    
    @Column(columnDefinition = "boolean default false")
    private Boolean isApproved = false;
    
    private Integer maxGuests;
    private Integer bedrooms;
    private Integer bathrooms;
    
    @Column(columnDefinition = "TEXT")
    private String amenities; // JSON format: ["WiFi", "Pool", "Garden", "Party Hall"]
    
    private String imageUrl;

    @Column(name = "image_urls", columnDefinition = "TEXT")
    private String imageUrls; // JSON format: ["https://...", "https://..."]
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
