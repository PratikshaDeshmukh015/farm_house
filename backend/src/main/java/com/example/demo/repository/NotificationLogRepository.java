package com.example.demo.repository;

import com.example.demo.entity.NotificationLog;
import com.example.demo.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
    List<NotificationLog> findByBooking(Booking booking);
    List<NotificationLog> findByBookingId(Long bookingId);
    List<NotificationLog> findByType(String type);
}
