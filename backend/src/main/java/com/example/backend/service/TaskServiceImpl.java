package com.example.backend.service;

import com.example.backend.dto.TaskResponseDTO;
import com.example.backend.model.Task;
import com.example.backend.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskServiceImpl implements TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Override
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    @Override
    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + id));
    }

    @Override
    public Task createTask(Task task) {
        return taskRepository.save(task);
    }

    @Override
    public Task updateTask(Long id, Task taskDetails) {
        Task task = getTaskById(id);
        if (taskDetails.getTitle() != null) task.setTitle(taskDetails.getTitle());
        if (taskDetails.getDescription() != null) task.setDescription(taskDetails.getDescription());
        if (taskDetails.getPriority() != null) task.setPriority(taskDetails.getPriority());
        if (taskDetails.getStatus() != null) task.setStatus(taskDetails.getStatus());
        return taskRepository.save(task);
    }

    @Override
    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    @Override
    public TaskResponseDTO getPaginatedTasks(int pageNo, int pageSize, String sortBy, String sortDir, String status, String keyword) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(pageNo, pageSize, sort);
        Page<Task> taskPage;

        boolean hasStatus = status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL");
        boolean hasKeyword = keyword != null && !keyword.trim().isEmpty();

        if (hasStatus && hasKeyword) {
            taskPage = taskRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCaseAndStatus(
                    keyword, keyword, status, pageable);
        } else if (hasStatus) {
            taskPage = taskRepository.findByStatus(status, pageable);
        } else if (hasKeyword) {
            taskPage = taskRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
                    keyword, keyword, pageable);
        } else {
            taskPage = taskRepository.findAll(pageable);
        }

        return new TaskResponseDTO(
                taskPage.getContent(),
                taskPage.getNumber(),
                taskPage.getTotalPages(),
                taskPage.getTotalElements(),
                taskPage.getSize(),
                taskPage.isLast()
        );
    }
}