package com.example.demo.repository;

import com.example.demo.entity.Receipt;
import com.example.demo.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, Long> {
    Optional<Receipt> findByBooking(Booking booking);
    Optional<Receipt> findByBookingId(Long bookingId);
    Optional<Receipt> findByReceiptNumber(String receiptNumber);
}
