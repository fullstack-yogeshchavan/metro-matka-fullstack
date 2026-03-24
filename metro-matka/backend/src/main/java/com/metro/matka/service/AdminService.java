package com.metro.matka.service;
import com.metro.matka.dto.request.GameRequest;
import com.metro.matka.dto.response.*;
import java.util.List;
public interface AdminService {
    List<UserAdminResponse> getAllUsers(int page, int size);
    void blockUser(Long id);
    void unblockUser(Long id);
    GameResponse createGame(GameRequest r);
    GameResponse updateGame(Long id, GameRequest r);
    AdminStatsResponse getPlatformStats();
    List<BetResponse> getAllBets(int page, int size);
}
