package com.skillbridge.ai.course;

import jakarta.validation.constraints.NotBlank;

public final class CourseDtos {
    private CourseDtos() {}

    public record CourseRequest(
            @NotBlank String title,
            String description,
            String category,
            String difficulty,
            boolean published
    ) {}

    public record CourseResponse(
            Long id, String title, String description, String category, String difficulty,
            Long trainerId, String trainerName, boolean published
    ) {}
}
