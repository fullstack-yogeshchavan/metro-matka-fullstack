package com.metro.matka.config;

import com.metro.matka.entity.User;
import com.metro.matka.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(1)
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        setupAdmin();
        setupPlayer();
        log.info("╔══════════════════════════════════════╗");
        log.info("║         LOGIN CREDENTIALS            ║");
        log.info("║  Admin  : admin    / admin123        ║");
        log.info("║  Player : player1  / player123       ║");
        log.info("╚══════════════════════════════════════╝");
    }

    private void setupAdmin() {
        String rawPassword = "admin123";
        String encoded = passwordEncoder.encode(rawPassword);

        userRepository.findByUsername("admin").ifPresentOrElse(
            existing -> {
                // Force update password with fresh encoding
                existing.setPassword(encoded);
                existing.setRole(User.Role.ADMIN);
                existing.setBlocked(false);
                existing.setEmailVerified(true);
                if (existing.getBalance() == null)      existing.setBalance(BigDecimal.ZERO);
                if (existing.getTotalWagered() == null) existing.setTotalWagered(BigDecimal.ZERO);
                if (existing.getTotalWon() == null)     existing.setTotalWon(BigDecimal.ZERO);
                userRepository.save(existing);
                log.info("Admin password updated. Login: admin / admin123");
            },
            () -> {
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@metromatka.com");
                admin.setPassword(encoded);
                admin.setRole(User.Role.ADMIN);
                admin.setBalance(BigDecimal.ZERO);
                admin.setTotalWagered(BigDecimal.ZERO);
                admin.setTotalWon(BigDecimal.ZERO);
                admin.setBlocked(false);
                admin.setEmailVerified(true);
                userRepository.save(admin);
                log.info("Admin created. Login: admin / admin123");
            }
        );
    }

    private void setupPlayer() {
        String rawPassword = "player123";
        String encoded = passwordEncoder.encode(rawPassword);

        userRepository.findByUsername("player1").ifPresentOrElse(
            existing -> {
                existing.setPassword(encoded);
                if (existing.getBalance() == null)      existing.setBalance(new BigDecimal("5000.00"));
                if (existing.getTotalWagered() == null) existing.setTotalWagered(BigDecimal.ZERO);
                if (existing.getTotalWon() == null)     existing.setTotalWon(BigDecimal.ZERO);
                userRepository.save(existing);
                log.info("Player1 password updated. Login: player1 / player123");
            },
            () -> {
                User player = new User();
                player.setUsername("player1");
                player.setEmail("player1@metromatka.com");
                player.setPassword(encoded);
                player.setRole(User.Role.PLAYER);
                player.setBalance(new BigDecimal("5000.00"));
                player.setTotalWagered(BigDecimal.ZERO);
                player.setTotalWon(BigDecimal.ZERO);
                player.setBlocked(false);
                player.setEmailVerified(true);
                userRepository.save(player);
                log.info("Player1 created. Login: player1 / player123");
            }
        );
    }
}
