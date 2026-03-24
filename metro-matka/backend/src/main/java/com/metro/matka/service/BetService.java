package com.metro.matka.service;
import com.metro.matka.dto.request.PlaceBetRequest;
import com.metro.matka.dto.response.BetResponse;
import java.util.List;
public interface BetService {
    List<BetResponse> placeBets(Long userId, PlaceBetRequest r);
    List<BetResponse> getUserBets(Long userId, int page, int size);
}
