package com.example.backend.service;

import com.example.backend.dto.TaskResponseDTO;
import com.example.backend.model.Task;
import java.util.List;

public interface TaskService {
    List<Task> getAllTasks();
    Task getTaskById(Long id);
    Task createTask(Task task);
    Task updateTask(Long id, Task task);
    void deleteTask(Long id);

    // New Paginated Method
    TaskResponseDTO getPaginatedTasks(int pageNo, int pageSize, String sortBy, String sortDir, String status, String keyword);
}