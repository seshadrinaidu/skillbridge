package com.skillbridge.ai.coding;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillbridge.ai.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class Judge0ExecutionService {
    private final String baseUrl;
    private final String apiKey;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public Judge0ExecutionService(@Value("${external.judge0.base-url:}") String baseUrl,
                                  @Value("${external.judge0.api-key:}") String apiKey,
                                  ObjectMapper objectMapper) {
        this.baseUrl = baseUrl == null ? "" : baseUrl.replaceAll("/+$", "");
        this.apiKey = apiKey;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    public boolean isConfigured() {
        return !baseUrl.isBlank();
    }

    public Map<String, Object> execute(String sourceCode, String stdin) {
        if (!isConfigured()) {
            throw new ApiException(503, "JUDGE_UNAVAILABLE", "Sandboxed code execution is not configured");
        }
        if (sourceCode == null || sourceCode.length() > 100_000) {
            throw new ApiException(400, "VALIDATION_ERROR", "Source code is required and must be under 100 KB");
        }
        if (stdin != null && stdin.length() > 10_000) {
            throw new ApiException(400, "VALIDATION_ERROR", "Standard input must be under 10 KB");
        }
        try {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("source_code", sourceCode);
            payload.put("language_id", 62);
            payload.put("stdin", stdin == null ? "" : stdin);
            payload.put("cpu_time_limit", 2);
            payload.put("memory_limit", 128000);
            payload.put("wall_time_limit", 5);

            HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + "/submissions?base64_encoded=false&wait=true"))
                    .timeout(Duration.ofSeconds(10))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)));
            if (apiKey != null && !apiKey.isBlank()) {
                requestBuilder.header("X-RapidAPI-Key", apiKey);
            }

            HttpResponse<String> response = httpClient.send(
                    requestBuilder.build(),
                    HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                throw new ApiException(503, "JUDGE_UNAVAILABLE",
                        "The code execution service returned HTTP " + response.statusCode());
            }

            JsonNode root = objectMapper.readTree(response.body());
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("stdout", text(root.get("stdout")));
            result.put("stderr", text(root.get("stderr")));
            result.put("compileOutput", text(root.get("compile_output")));
            result.put("message", text(root.get("message")));
            result.put("time", text(root.get("time")));
            result.put("memory", root.has("memory") && !root.get("memory").isNull() ? root.get("memory").asInt() : null);
            JsonNode status = root.get("status");
            result.put("status", status == null ? "UNKNOWN" : text(status.get("description")));
            result.put("statusId", status == null ? null : status.has("id") ? status.get("id").asInt() : null);
            return result;
        } catch (ApiException ex) {
            throw ex;
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new ApiException(503, "JUDGE_UNAVAILABLE", "The code execution request was interrupted");
        } catch (Exception ex) {
            throw new ApiException(503, "JUDGE_UNAVAILABLE", "Unable to reach the code execution service");
        }
    }

    private String text(JsonNode node) {
        return node == null || node.isNull() ? "" : node.asText();
    }
}
