package com.metro.matka.repository;

import com.metro.matka.entity.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GameRepository extends JpaRepository<Game, Long> {

    List<Game> findByStatus(Game.GameStatus status);

    Optional<Game> findByName(String name);

    Optional<Game> findById(Long id);


   // @Query("SELECT g FROM Game g LEFT JOIN FETCH g.currentRound WHERE g.id = :id")
  //  Optional<Game> findByIdWithRound(@Param("id") Long id);

   // @Query("SELECT g FROM Game g LEFT JOIN FETCH g.currentRound WHERE g.status = :status")
    //List<Game> findByStatusWithRound(@Param("status") Game.GameStatus status);
}