package com.skillbridge.ai.enrollment;

import jakarta.validation.constraints.NotNull;

public final class EnrollmentDtos {
    private EnrollmentDtos() {}

    public record EnrollRequest(@NotNull Long courseId) {}

    public record EnrollmentResponse(Long id, Long courseId, String courseTitle, String status, String enrolledAt) {}
}
