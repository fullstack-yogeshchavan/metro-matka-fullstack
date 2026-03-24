package com.metro.matka.repository;
import com.metro.matka.entity.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.Optional;
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Page<Transaction> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    Optional<Transaction> findByPaymentOrderId(String orderId);
    @Query("SELECT COALESCE(ABS(SUM(t.amount)),0) FROM Transaction t WHERE t.type='WITHDRAWAL' AND t.status='PENDING'")
    BigDecimal sumPendingWithdrawals();
    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.type='WITHDRAWAL' AND t.status='PENDING'")
    long countPendingWithdrawals();
}
