package com.metro.matka.service;
import com.metro.matka.dto.response.*;
import java.util.List;
public interface GameService {
    List<GameResponse> getActiveGames();
    GameResponse getGameById(Long id);
    DrawResponse getActiveDraw(Long gameId);
    List<DrawResponse> getDrawHistory(Long gameId, int page, int size);
}
