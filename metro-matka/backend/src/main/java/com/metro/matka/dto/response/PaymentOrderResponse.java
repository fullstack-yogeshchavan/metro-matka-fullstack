package com.metro.matka.dto.response;
import lombok.*;
import java.math.BigDecimal;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PaymentOrderResponse {
    private String orderId, currency, keyId, userName, userEmail;
    private BigDecimal amount;
}
