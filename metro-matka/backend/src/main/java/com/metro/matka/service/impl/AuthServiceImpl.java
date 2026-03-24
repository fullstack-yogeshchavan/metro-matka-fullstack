package com.metro.matka.service.impl;

import com.metro.matka.dto.request.*;
import com.metro.matka.dto.response.AuthResponse;
import com.metro.matka.entity.User;
import com.metro.matka.exception.*;
import com.metro.matka.repository.UserRepository;
import com.metro.matka.security.JwtUtil;
import com.metro.matka.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;

    @Override
    public AuthResponse register(RegisterRequest req) {
        if (userRepo.existsByUsername(req.getUsername()))
            throw new BadRequestException("Username already taken");
        if (userRepo.existsByEmail(req.getEmail()))
            throw new BadRequestException("Email already registered");

        // Use setters to avoid @Builder.Default issues with Lombok
        User user = new User();
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setPassword(encoder.encode(req.getPassword()));
        user.setPhoneNumber(req.getPhoneNumber());
        user.setRole(User.Role.PLAYER);
        user.setBalance(BigDecimal.ZERO);
        user.setTotalWagered(BigDecimal.ZERO);
        user.setTotalWon(BigDecimal.ZERO);
        user.setBlocked(false);
        user.setEmailVerified(false);

        user = userRepo.save(user);
        log.info("New user registered: {}", user.getUsername());

        String access = jwtUtil.generateToken(user);
        String refresh = jwtUtil.generateRefreshToken(user);
        user.setRefreshToken(encoder.encode(refresh));
        userRepo.save(user);

        return buildResponse(user, access, refresh);
    }

    @Override
    public AuthResponse login(LoginRequest req) {
        try {
            authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            req.getUsernameOrEmail(), req.getPassword()));
        } catch (BadCredentialsException e) {
            throw new UnauthorizedException("Invalid username or password");
        } catch (Exception e) {
            throw new UnauthorizedException("Authentication failed: " + e.getMessage());
        }

        User user = userRepo.findByUsernameOrEmail(
                        req.getUsernameOrEmail(), req.getUsernameOrEmail())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (user.isBlocked())
            throw new UnauthorizedException("Account is blocked. Contact support.");

        // Fix null BigDecimal fields if they exist from old data
        if (user.getBalance() == null) user.setBalance(BigDecimal.ZERO);
        if (user.getTotalWagered() == null) user.setTotalWagered(BigDecimal.ZERO);
        if (user.getTotalWon() == null) user.setTotalWon(BigDecimal.ZERO);

        user.setLastLogin(LocalDateTime.now());

        String access = jwtUtil.generateToken(user);
        String refresh = jwtUtil.generateRefreshToken(user);
        user.setRefreshToken(encoder.encode(refresh));
        userRepo.save(user);

        log.info("User logged in: {}", user.getUsername());
        return buildResponse(user, access, refresh);
    }

    @Override
    public AuthResponse refreshToken(String token) {
        String username = jwtUtil.extractUsername(token);
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        String access = jwtUtil.generateToken(user);
        String newRefresh = jwtUtil.generateRefreshToken(user);
        user.setRefreshToken(encoder.encode(newRefresh));
        userRepo.save(user);

        return buildResponse(user, access, newRefresh);
    }

    @Override
    public void logout(String username) {
        userRepo.findByUsername(username).ifPresent(u -> {
            u.setRefreshToken(null);
            userRepo.save(u);
        });
    }

    private AuthResponse buildResponse(User u, String access, String refresh) {
        return AuthResponse.builder()
                .accessToken(access)
                .refreshToken(refresh)
                .tokenType("Bearer")
                .expiresIn(86400L)
                .userId(u.getId())
                .username(u.getUsername())
                .email(u.getEmail())
                .role(u.getRole().name())
                .balance(u.getBalance() != null ? u.getBalance() : BigDecimal.ZERO)
                .build();
    }
}
