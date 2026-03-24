package com.metro.matka.dto.response;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DrawResponse {
    private Long id, gameId, secondsUntilDraw;
    private String gameName, resultNumber, status;
    private Integer roundNumber;
    private LocalDateTime scheduledAt, drawnAt, bettingClosesAt;
    private BigDecimal totalBetsAmount, totalPayout, houseProfit;
}
