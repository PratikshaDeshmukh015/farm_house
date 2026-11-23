package com.example.demo.controller;

import com.example.demo.dto.FarmHouseDTO;
import com.example.demo.service.FarmHouseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/farmhouses")
public class FarmHouseController {
    
    @Autowired
    private FarmHouseService farmHouseService;
    
    /**
     * Add new farm house (Owner only)
     * POST /api/farmhouses
     * Headers: owner-id
     */
    @PostMapping
    public ResponseEntity<?> addFarmHouse(@RequestBody FarmHouseDTO farmHouseDTO, 
                                         @RequestHeader("owner-id") Long ownerId) {
        try {
            FarmHouseDTO newFarmHouse = farmHouseService.addFarmHouse(farmHouseDTO, ownerId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Farm house added successfully");
            response.put("farmhouse", newFarmHouse);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    /**
     * Get all approved farm houses - paginated
     * GET /api/farmhouses?page=0&size=10
     */
    @GetMapping
    public ResponseEntity<?> getAllFarmHouses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<FarmHouseDTO> farmHouses = farmHouseService.getAllApprovedFarmHouses(pageable);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("farmhouses", farmHouses.getContent());
            response.put("totalPages", farmHouses.getTotalPages());
            response.put("totalElements", farmHouses.getTotalElements());
            response.put("currentPage", page);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Get all farm houses (both approved and unapproved) - paginated
     * GET /api/farmhouses/all?page=0&size=10
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllFarmHousesAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<FarmHouseDTO> farmHouses = farmHouseService.getAllFarmHouses(pageable);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("farmhouses", farmHouses.getContent());
            response.put("totalPages", farmHouses.getTotalPages());
            response.put("totalElements", farmHouses.getTotalElements());
            response.put("currentPage", page);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Get farm house by ID
     * GET /api/farmhouses/:id
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getFarmHouseById(@PathVariable Long id) {
        try {
            FarmHouseDTO farmHouse = farmHouseService.getFarmHouseById(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("farmhouse", farmHouse);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    /**
     * Get farm houses by owner
     * GET /api/farmhouses/owner/:ownerId
     */
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<?> getFarmHousesByOwner(@PathVariable Long ownerId) {
        try {
            List<FarmHouseDTO> farmHouses = farmHouseService.getFarmHousesByOwner(ownerId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("farmhouses", farmHouses);
            response.put("count", farmHouses.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    /**
     * Search farm houses by location
     * GET /api/farmhouses/search/location?query=Delhi&page=0&size=10
     */
    @GetMapping("/search/location")
    public ResponseEntity<?> searchByLocation(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<FarmHouseDTO> farmHouses = farmHouseService.searchByLocation(query, pageable);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("farmhouses", farmHouses.getContent());
            response.put("totalPages", farmHouses.getTotalPages());
            response.put("totalElements", farmHouses.getTotalElements());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    /**
     * Search farm houses by price range
     * GET /api/farmhouses/search/price?minPrice=1000&maxPrice=5000&page=0&size=10
     */
    @GetMapping("/search/price")
    public ResponseEntity<?> searchByPrice(
            @RequestParam Double minPrice,
            @RequestParam Double maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<FarmHouseDTO> farmHouses = farmHouseService.searchByPriceRange(minPrice, maxPrice, pageable);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("farmhouses", farmHouses.getContent());
            response.put("totalPages", farmHouses.getTotalPages());
            response.put("totalElements", farmHouses.getTotalElements());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    /**
     * Update farm house
     * PUT /api/farmhouses/:id
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateFarmHouse(@PathVariable Long id,
                                             @RequestBody FarmHouseDTO farmHouseDTO,
                                             @RequestHeader("owner-id") Long requesterId) {
        try {
            FarmHouseDTO updatedFarmHouse = farmHouseService.updateFarmHouse(id, farmHouseDTO, requesterId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Farm house updated successfully");
            response.put("farmhouse", updatedFarmHouse);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    /**
     * Approve farm house (Admin only)
     * PUT /api/farmhouses/:id/approve
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveFarmHouse(@PathVariable Long id) {
        try {
            FarmHouseDTO approvedFarmHouse = farmHouseService.approveFarmHouse(id);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Farm house approved successfully");
            response.put("farmhouse", approvedFarmHouse);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    /**
     * Delete farm house
     * DELETE /api/farmhouses/:id
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFarmHouse(@PathVariable Long id,
                                             @RequestHeader("owner-id") Long requesterId) {
        try {
            farmHouseService.deleteFarmHouse(id, requesterId);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Farm house deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
