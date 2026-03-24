package com.metro.matka.dto.response;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserAdminResponse {
    private Long id;
    private String username, email, phoneNumber, role;
    private BigDecimal balance, totalWagered, totalWon;
    private boolean blocked, emailVerified;
    private LocalDateTime lastLogin, createdAt;
}
