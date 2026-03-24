package com.metro.matka.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlaceBetRequest {
    @NotNull
    private Long gameId;
    @NotEmpty
    private List<String> betNumbers;
    @NotNull
    @DecimalMin("1.00")
    @DecimalMax("500.00")
    private BigDecimal chipAmount;
}
