package com.example.backend.service;

import com.example.backend.model.Task;
import java.util.List;

public interface TaskService {
    List<Task> getAllTasks(String status);
    Task createTask(Task task);
    Task updateTaskStatus(Long id, String status);
    void deleteTask(Long id);
}