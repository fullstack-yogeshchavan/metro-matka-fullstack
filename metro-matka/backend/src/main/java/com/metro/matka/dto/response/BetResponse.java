package com.metro.matka.dto.response;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BetResponse {
    private Long id;
    private String betNumber, status, winType, gameName;
    private BigDecimal betAmount, payoutAmount;
    private Integer roundNumber;
    private LocalDateTime placedAt, settledAt;
}
