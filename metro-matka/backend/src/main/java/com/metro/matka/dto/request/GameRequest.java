package com.metro.matka.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GameRequest {
    @NotBlank
    @Size(max = 50)
    private String name;
    private String description;
    @Min(60)
    @Max(3600)
    private Integer drawIntervalSeconds = 180;
    @Min(10)
    @Max(120)
    private Integer bettingCloseBeforeSeconds = 30;
    @Min(10)
    @Max(10000)
    private Integer jackpotMultiplier = 800;
    @Min(2)
    @Max(100)
    private Integer partialMultiplier = 10;
    private String drawMode = "AUTO";
}
