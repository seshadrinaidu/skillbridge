package com.skillbridge.ai.assessment;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public final class AssessmentDtos {
    private AssessmentDtos() {}

    public record AssessmentResponse(Long id, String title, String description, List<QuestionResponse> questions) {}
    public record QuestionResponse(Long id, String questionText, String questionType, String options) {}
    public record SubmitRequest(@Valid List<AnswerRequest> answers) {}
    public record AnswerRequest(@NotNull Long questionId, @NotNull String answer) {}
    public record SubmitResponse(Long attemptId, int scorePercent, int correctAnswers, int totalQuestions) {}
    public record PerformanceResponse(String skill, int scorePercent, int attemptCount, String status, String evidence) {}
}
