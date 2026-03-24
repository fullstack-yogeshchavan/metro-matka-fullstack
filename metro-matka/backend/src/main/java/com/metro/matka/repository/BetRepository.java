package com.metro.matka.repository;

import com.metro.matka.entity.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BetRepository extends JpaRepository<Bet, Long> {
    List<Bet> findByDrawAndStatus(Draw draw, Bet.BetStatus status);

    List<Bet> findByDrawId(Long drawId);

    Page<Bet> findByUserIdOrderByPlacedAtDesc(Long userId, Pageable pageable);

    Page<Bet> findAllByOrderByPlacedAtDesc(Pageable pageable);

    long countByStatus(Bet.BetStatus status);
}
