package com.example.backend.repository;

import com.example.backend.model.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    // Search by title/description containing keyword AND filter by status
    Page<Task> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCaseAndStatus(
            String title, String description, String status, Pageable pageable);

    // Search by title/description containing keyword across ALL statuses
    Page<Task> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String title, String description, Pageable pageable);

    // Filter purely by status with pagination
    Page<Task> findByStatus(String status, Pageable pageable);
}