package com.metro.matka.service;
import com.metro.matka.entity.Draw;
public interface DrawService {
    void executeDraw(Draw draw);
    void executeManualDraw(Long gameId, String result, Long adminId);
}
