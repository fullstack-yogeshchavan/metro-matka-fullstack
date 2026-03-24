package com.metro.matka.dto.response;
import lombok.*;
import java.math.BigDecimal;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DrawResultEvent {
    private Long gameId, drawId;
    private String gameName, result;
    private Integer roundNumber, digit1, digit2, digit3;
    private BigDecimal totalPayout;
}
