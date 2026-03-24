package com.metro.matka.dto.response;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TimerEvent {
    private Long gameId, drawId, secondsLeft;
    private String gameName;
    private Integer roundNumber;
    private boolean bettingOpen;
}
