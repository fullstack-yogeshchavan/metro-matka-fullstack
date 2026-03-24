package com.metro.matka.repository;

import com.metro.matka.entity.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.*;

public interface DrawRepository extends JpaRepository<Draw, Long> {
    Optional<Draw> findFirstByGameAndStatusIn(Game game, List<Draw.DrawStatus> statuses);

    Page<Draw> findByGameIdOrderByRoundNumberDesc(Long gameId, Pageable pageable);
}
