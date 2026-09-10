package com.example.demo.repository;

import com.example.demo.entity.Discount;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface DiscountRepository extends JpaRepository<Discount, Long> {

    /** All active discounts whose validity window includes today and discountPercent > 0 (for homepage) */
    @Query("SELECT d FROM Discount d WHERE d.isActive = true " +
           "AND d.discountPercent > 0 " +
           "AND (d.validFrom IS NULL OR d.validFrom <= :today) " +
           "AND (d.validTo IS NULL OR d.validTo >= :today)")
    List<Discount> findActiveDiscounts(LocalDate today);

    /** All discounts created by a specific user (for owner dashboard) */
    List<Discount> findByCreatedBy(User createdBy);

    /** Discounts created by an owner or assigned to one of their farmhouses. */
    List<Discount> findByCreatedByOrFarmhouse_Owner(User createdBy, User farmhouseOwner);

    /** All discounts — for admin view */
    List<Discount> findAllByOrderByCreatedAtDesc();
}
