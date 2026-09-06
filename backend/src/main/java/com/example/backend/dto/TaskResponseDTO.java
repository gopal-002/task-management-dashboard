package com.example.backend.dto;

import com.example.backend.model.Task;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponseDTO {
    private List<Task> tasks;
    private int currentPage;
    private int totalPages;
    private long totalElements;
    private int pageSize;
    private boolean isLast;
}