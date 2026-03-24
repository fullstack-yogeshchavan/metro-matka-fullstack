package com.metro.matka.repository;
import com.metro.matka.entity.User;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.Optional;
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByUsernameOrEmail(String username, String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    Page<User> findAllByOrderByCreatedAtDesc(Pageable pageable);
    long countByBlocked(boolean blocked);
    @Query("SELECT COALESCE(SUM(u.totalWagered),0) FROM User u") BigDecimal sumTotalWagered();
    @Query("SELECT COALESCE(SUM(u.totalWon),0) FROM User u") BigDecimal sumTotalWon();
}
