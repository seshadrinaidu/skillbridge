package com.skillbridge.ai.ai;

import com.skillbridge.ai.exception.ApiException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
public class AiAssistanceController {
    private final OpenAiService openAi;

    public AiAssistanceController(OpenAiService openAi) {
        this.openAi = openAi;
    }

    @PostMapping("/hint")
    public Map<String, Object> hint(@Valid @RequestBody HintRequest request) {
        if (!openAi.isConfigured()) {
            throw new ApiException(503, "OPENAI_UNAVAILABLE", "OpenAI assistance is not configured");
        }
        String answer = openAi.generate(
                "You are a progressive coding tutor. Give a useful hint without revealing the complete solution.",
                "Topic: " + request.topic() + "\nPrompt: " + request.prompt());
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("hint", answer);
        result.put("provider", "OpenAI");
        return result;
    }

    @PostMapping("/roadmap")
    public Map<String, Object> roadmap(@Valid @RequestBody RoadmapRequest request) {
        if (!openAi.isConfigured()) {
            throw new ApiException(503, "OPENAI_UNAVAILABLE", "OpenAI assistance is not configured");
        }
        String answer = openAi.generate(
                "Create concise, realistic learning milestones as plain structured text.",
                "Target role: " + request.targetRole() + "\nWeekly hours: " + request.weeklyHours());
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("recommendation", answer);
        result.put("provider", "OpenAI");
        return result;
    }

    public record HintRequest(@NotBlank String topic, @NotBlank String prompt) {}
    public record RoadmapRequest(@NotBlank String targetRole, Integer weeklyHours) {}
}
