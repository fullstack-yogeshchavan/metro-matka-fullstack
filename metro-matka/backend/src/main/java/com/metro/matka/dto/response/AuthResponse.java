package com.metro.matka.dto.response;
import lombok.*;
import java.math.BigDecimal;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AuthResponse {
    private String accessToken, refreshToken, tokenType, email, username, role;
    private Long expiresIn, userId;
    private BigDecimal balance;
}
