package com.skillbridge.ai.coding;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public final class CodingDtos {
    private CodingDtos(){}
    public record ProblemResponse(Long id,String title,String difficulty,String topic,String statement,String starterCode,
                                  String sampleInput,String sampleOutput,String constraints){}
    public record SubmissionRequest(@NotBlank String code,@NotNull String language){}
    public record SubmissionResponse(Long id,Long problemId,String verdict,int scorePercent,String feedback,String submittedAt){}
    public record HintResponse(int level,String hint){}
}
