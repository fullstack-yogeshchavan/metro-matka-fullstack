package com.metro.matka.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WithdrawalRequest {
    @NotNull
    @DecimalMin("500.00")
    private BigDecimal amount;
    @NotBlank
    private String accountNumber;
    @NotBlank
    private String ifscCode;
    @NotBlank
    private String accountHolderName;
    @NotBlank
    private String bankName;
}
