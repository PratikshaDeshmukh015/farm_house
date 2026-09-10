package com.example.demo.service;

import com.example.demo.dto.DiscountDTO;
import com.example.demo.entity.Discount;
import com.example.demo.entity.User;
import com.example.demo.entity.FarmHouse;
import com.example.demo.repository.DiscountRepository;
import com.example.demo.repository.FarmHouseRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DiscountService {

    @Autowired
    private DiscountRepository discountRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FarmHouseRepository farmHouseRepository;

    // ──────────────────────────────────────────────────────────────────────────
    // PUBLIC — used by homepage
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Returns all currently active discounts (for homepage display, no auth needed).
     */
    public List<DiscountDTO> getAllActiveDiscounts() {
        return discountRepository.findActiveDiscounts(LocalDate.now())
                .stream()
                .filter(d -> d.getDiscountPercent() != null && d.getDiscountPercent() > 0)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ──────────────────────────────────────────────────────────────────────────
    // ADMIN — all discounts
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Returns all discounts ordered by creation date (admin view).
     */
    public List<DiscountDTO> getAllDiscounts(Long requesterId) {
        User requester = getAndValidateUser(requesterId);
        if (requester.getRole() != User.Role.ADMIN && requester.getRole() != User.Role.SUPERADMIN) {
            throw new AccessDeniedException("Only admins can view all discounts");
        }
        return discountRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ──────────────────────────────────────────────────────────────────────────
    // OWNER — own discounts
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Returns discounts created by a specific owner.
     */
    public List<DiscountDTO> getDiscountsByOwner(Long ownerId, Long requesterId) {
        User requester = getAndValidateUser(requesterId);
        // Owner can only see own; admin can see any owner's discounts
        if (requester.getRole() == User.Role.CUSTOMER) {
            throw new AccessDeniedException("Customers cannot view discount management");
        }
        if (requester.getRole() == User.Role.OWNER && !requester.getId().equals(ownerId)) {
            throw new AccessDeniedException("Owners can only view their own discounts");
        }
        User owner = getAndValidateUser(ownerId);
        return discountRepository.findByCreatedByOrFarmhouse_Owner(owner, owner)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ──────────────────────────────────────────────────────────────────────────
    // CREATE
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Creates a new discount. Allowed for OWNER, ADMIN, SUPERADMIN.
     */
    public DiscountDTO createDiscount(DiscountDTO dto, Long userId) {
        User creator = getAndValidateUser(userId);
        if (!canManageDiscounts(creator)) {
            throw new AccessDeniedException("Only owners and admins can create discounts");
        }
        validateDiscount(dto);

        Discount discount = new Discount();
        discount.setTitle(dto.getTitle());
        discount.setDescription(dto.getDescription());
        discount.setFarmhouseType(dto.getFarmhouseType() == null ? Discount.FarmhouseType.ALL : dto.getFarmhouseType());
        discount.setDiscountPercent(dto.getDiscountPercent());
        discount.setSpecialOffer(dto.getSpecialOffer());
        discount.setValidFrom(dto.getValidFrom());
        discount.setValidTo(dto.getValidTo());
        discount.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        discount.setCreatedBy(creator);

        if (dto.getFarmhouseId() != null) {
            FarmHouse fh = farmHouseRepository.findById(dto.getFarmhouseId())
                    .orElseThrow(() -> new RuntimeException("Farmhouse not found with id: " + dto.getFarmhouseId()));
            if (creator.getRole() == User.Role.OWNER && !fh.getOwner().getId().equals(creator.getId())) {
                throw new AccessDeniedException("Owners can only create discounts for their own farmhouses");
            }
            discount.setFarmhouse(fh);
        }

        return convertToDTO(discountRepository.save(discount));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // UPDATE
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Updates a discount. Owner can update only their own; Admin can update any.
     */
    public DiscountDTO updateDiscount(Long id, DiscountDTO dto, Long userId) {
        User requester = getAndValidateUser(userId);
        if (!canManageDiscounts(requester)) {
            throw new AccessDeniedException("Only owners and admins can update discounts");
        }

        Optional<Discount> optional = discountRepository.findById(id);
        if (optional.isEmpty()) {
            throw new RuntimeException("Discount not found");
        }
        Discount discount = optional.get();

        if (requester.getRole() == User.Role.OWNER && !canOwnerManageDiscount(discount, requester)) {
            throw new AccessDeniedException("You can only update your own discounts");
        }

        validateDiscount(dto, discount);

        if (dto.getTitle() != null)          discount.setTitle(dto.getTitle());
        if (dto.getDescription() != null)    discount.setDescription(dto.getDescription());
        if (dto.getFarmhouseType() != null)  discount.setFarmhouseType(dto.getFarmhouseType());
        if (dto.getDiscountPercent() != null) discount.setDiscountPercent(dto.getDiscountPercent());
        if (dto.getSpecialOffer() != null)   discount.setSpecialOffer(dto.getSpecialOffer());
        if (dto.getValidFrom() != null)      discount.setValidFrom(dto.getValidFrom());
        if (dto.getValidTo() != null)        discount.setValidTo(dto.getValidTo());
        if (dto.getIsActive() != null)       discount.setIsActive(dto.getIsActive());

        if (dto.getFarmhouseId() != null) {
            if (dto.getFarmhouseId() == 0L) {
                discount.setFarmhouse(null);
            } else {
                FarmHouse fh = farmHouseRepository.findById(dto.getFarmhouseId())
                        .orElseThrow(() -> new RuntimeException("Farmhouse not found with id: " + dto.getFarmhouseId()));
                if (requester.getRole() == User.Role.OWNER && !fh.getOwner().getId().equals(requester.getId())) {
                    throw new AccessDeniedException("Owners can only create discounts for their own farmhouses");
                }
                discount.setFarmhouse(fh);
            }
        }

        return convertToDTO(discountRepository.save(discount));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // DELETE
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Deletes a discount. Owner can delete only their own; Admin can delete any.
     */
    public void deleteDiscount(Long id, Long userId) {
        User requester = getAndValidateUser(userId);
        if (!canManageDiscounts(requester)) {
            throw new AccessDeniedException("Only owners and admins can delete discounts");
        }

        Optional<Discount> optional = discountRepository.findById(id);
        if (optional.isEmpty()) {
            throw new RuntimeException("Discount not found");
        }
        Discount discount = optional.get();

        if (requester.getRole() == User.Role.OWNER && !canOwnerManageDiscount(discount, requester)) {
            throw new AccessDeniedException("You can only delete your own discounts");
        }

        discountRepository.deleteById(id);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ──────────────────────────────────────────────────────────────────────────

    private User getAndValidateUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
    }

    private boolean canManageDiscounts(User user) {
        return user.getRole() == User.Role.OWNER
                || user.getRole() == User.Role.ADMIN
                || user.getRole() == User.Role.SUPERADMIN;
    }

    private boolean canOwnerManageDiscount(Discount discount, User owner) {
        return discount.getCreatedBy().getId().equals(owner.getId())
                || (discount.getFarmhouse() != null
                && discount.getFarmhouse().getOwner().getId().equals(owner.getId()));
    }

    private void validateDiscount(DiscountDTO dto) {
        if (dto.getTitle() == null || dto.getTitle().isBlank()) {
            throw new IllegalArgumentException("Discount title is required");
        }
        if (dto.getDiscountPercent() == null
                || dto.getDiscountPercent() < 0
                || dto.getDiscountPercent() >= 100) {
            throw new IllegalArgumentException("Discount must be between 0 and 99 percent");
        }
        if (dto.getValidFrom() != null && dto.getValidTo() != null
                && dto.getValidFrom().isAfter(dto.getValidTo())) {
            throw new IllegalArgumentException("Valid from date cannot be after valid to date");
        }
    }

    private void validateDiscount(DiscountDTO dto, Discount existing) {
        DiscountDTO candidate = new DiscountDTO();
        candidate.setTitle(dto.getTitle() == null ? existing.getTitle() : dto.getTitle());
        candidate.setDiscountPercent(dto.getDiscountPercent() == null
                ? existing.getDiscountPercent() : dto.getDiscountPercent());
        candidate.setValidFrom(dto.getValidFrom() == null ? existing.getValidFrom() : dto.getValidFrom());
        candidate.setValidTo(dto.getValidTo() == null ? existing.getValidTo() : dto.getValidTo());
        validateDiscount(candidate);
    }

    private DiscountDTO convertToDTO(Discount d) {
        DiscountDTO dto = new DiscountDTO();
        dto.setId(d.getId());
        dto.setTitle(d.getTitle());
        dto.setDescription(d.getDescription());
        dto.setFarmhouseType(d.getFarmhouseType());
        if (d.getFarmhouse() != null) {
            dto.setFarmhouseId(d.getFarmhouse().getId());
            dto.setFarmhouseName(d.getFarmhouse().getName());
        }
        dto.setDiscountPercent(d.getDiscountPercent());
        dto.setSpecialOffer(d.getSpecialOffer());
        dto.setValidFrom(d.getValidFrom());
        dto.setValidTo(d.getValidTo());
        dto.setIsActive(d.getIsActive());
        dto.setCreatedById(d.getCreatedBy().getId());
        dto.setCreatedByName(d.getCreatedBy().getName());
        dto.setCreatedByRole(d.getCreatedBy().getRole().name());
        return dto;
    }
}
