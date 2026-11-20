package com.tarea.tarea.models;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AvistamientoRepository extends JpaRepository<Avistamiento, Integer> {

    @Query("SELECT DISTINCT a FROM Avistamiento a " +
           "JOIN FETCH a.voluntario v " +
           "JOIN FETCH v.comuna c " +
           "JOIN FETCH a.ave ave " +
           "LEFT JOIN FETCH a.notas n " +
           "WHERE LOWER(ave.nombre) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "   OR LOWER(v.nombre) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "   OR LOWER(c.nombre) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "ORDER BY a.fechaHora DESC")
    List<Avistamiento> buscarPorTermino(@Param("q") String q);

    @Query("SELECT DISTINCT a FROM Avistamiento a " +
           "JOIN FETCH a.voluntario v " +
           "JOIN FETCH v.comuna c " +
           "JOIN FETCH a.ave ave " +
           "LEFT JOIN FETCH a.notas n " +
           "ORDER BY a.fechaHora DESC")
    List<Avistamiento> findAllConRelaciones();
}
