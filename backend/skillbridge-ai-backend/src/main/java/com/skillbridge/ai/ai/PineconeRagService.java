package com.skillbridge.ai.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillbridge.ai.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class PineconeRagService {
    private final String openAiKey;
    private final String pineconeKey;
    private final String pineconeHost;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public PineconeRagService(@Value("${external.openai.api-key:}") String openAiKey,
                              @Value("${external.pinecone.api-key:}") String pineconeKey,
                              @Value("${external.pinecone.host:}") String pineconeHost,
                              ObjectMapper objectMapper) {
        this.openAiKey = openAiKey;
        this.pineconeKey = pineconeKey;
        this.pineconeHost = pineconeHost == null ? "" : pineconeHost.replaceAll("/+$", "");
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();
    }

    public boolean isConfigured() {
        return openAiKey != null && !openAiKey.isBlank()
                && pineconeKey != null && !pineconeKey.isBlank()
                && !pineconeHost.isBlank();
    }

    public List<Double> embed(String text) {
        requireConfiguration();
        if (text == null || text.isBlank() || text.length() > 20_000) {
            throw new ApiException(400, "VALIDATION_ERROR", "Content must be between 1 and 20 KB");
        }
        Map<String, Object> payload = Map.of(
                "model", "text-embedding-3-small",
                "input", text);
        try {
            HttpResponse<String> response = send("https://api.openai.com/v1/embeddings",
                    payload, "Bearer " + openAiKey);
            if (response.statusCode() >= 400) {
                throw new ApiException(503, "RAG_UNAVAILABLE", "Embedding service returned HTTP " + response.statusCode());
            }
            JsonNode root = objectMapper.readTree(response.body());
            JsonNode values = root.path("data").path(0).path("embedding");
            List<Double> result = new ArrayList<>();
            values.forEach(value -> result.add(value.asDouble()));
            if (result.isEmpty()) {
                throw new ApiException(502, "RAG_INVALID_RESPONSE", "Embedding service returned no vector");
            }
            return result;
        } catch (ApiException ex) {
            throw ex;
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new ApiException(503, "RAG_UNAVAILABLE", "Embedding request was interrupted");
        } catch (Exception ex) {
            throw new ApiException(503, "RAG_UNAVAILABLE", "Unable to reach embedding service");
        }
    }

    public void upsert(String vectorId, String sourceKey, String title, boolean isPublic,
                       Long ownerId, String content, List<Double> vector) {
        requireConfiguration();
        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("sourceKey", sourceKey);
        metadata.put("title", title);
        metadata.put("isPublic", isPublic);
        if (ownerId != null) metadata.put("ownerId", ownerId);
        metadata.put("content", content.length() <= 4000 ? content : content.substring(0, 4000));

        Map<String, Object> payload = Map.of(
                "vectors", List.of(Map.of("id", vectorId, "values", vector, "metadata", metadata)));
        try {
            HttpResponse<String> response = send(pineconeHost + "/vectors/upsert",
                    payload, "ApiKey " + pineconeKey);
            if (response.statusCode() >= 400) {
                throw new ApiException(503, "RAG_UNAVAILABLE", "Pinecone returned HTTP " + response.statusCode());
            }
        } catch (ApiException ex) {
            throw ex;
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new ApiException(503, "RAG_UNAVAILABLE", "Pinecone request was interrupted");
        } catch (Exception ex) {
            throw new ApiException(503, "RAG_UNAVAILABLE", "Unable to reach Pinecone");
        }
    }

    public void delete(String vectorId) {
        requireConfiguration();
        try {
            Map<String, Object> payload = Map.of("ids", List.of(vectorId));
            HttpResponse<String> response = send(pineconeHost + "/vectors/delete", payload,
                    "ApiKey " + pineconeKey);
            if (response.statusCode() >= 400) {
                throw new ApiException(503, "RAG_UNAVAILABLE", "Pinecone delete returned HTTP " + response.statusCode());
            }
        } catch (ApiException ex) {
            throw ex;
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new ApiException(503, "RAG_UNAVAILABLE", "Pinecone request was interrupted");
        } catch (Exception ex) {
            throw new ApiException(503, "RAG_UNAVAILABLE", "Unable to reach Pinecone");
        }
    }

    private void requireConfiguration() {
        if (!isConfigured()) {
            throw new ApiException(503, "RAG_UNAVAILABLE",
                    "Pinecone RAG and embeddings are not configured");
        }
    }

    private HttpResponse<String> send(String url, Map<String, Object> payload, String authorization)
            throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(30))
                .header("Authorization", authorization)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                .build();
        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }

    public String hash(String content) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(content.getBytes(StandardCharsets.UTF_8));
            StringBuilder result = new StringBuilder();
            for (byte value : digest) result.append(String.format("%02x", value));
            return result.toString();
        } catch (Exception ex) {
            throw new IllegalStateException(ex);
        }
    }
}
