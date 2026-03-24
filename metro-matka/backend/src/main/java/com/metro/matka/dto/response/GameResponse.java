package com.metro.matka.dto.response;
import lombok.*;
import java.time.LocalDateTime;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class GameResponse {
    private Long id;
    private String name, description, drawMode, status;
    private Integer drawIntervalSeconds, bettingCloseBeforeSeconds, jackpotMultiplier, partialMultiplier, currentRound;
    private LocalDateTime nextDrawAt;
}
