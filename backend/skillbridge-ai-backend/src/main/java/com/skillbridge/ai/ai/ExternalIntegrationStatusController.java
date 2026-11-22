package com.skillbridge.ai.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/integrations")
public class ExternalIntegrationStatusController {
    private final boolean googleEnabled;
    private final boolean judge0Enabled;
    private final boolean openAiEnabled;
    private final boolean pineconeEnabled;

    public ExternalIntegrationStatusController(
            @Value("${GOOGLE_CLIENT_ID:}") String googleId,
            @Value("${GOOGLE_CLIENT_SECRET:}") String googleSecret,
            @Value("${external.judge0.base-url:}") String judge0Url,
            @Value("${external.openai.api-key:}") String openAiKey,
            @Value("${external.pinecone.api-key:}") String pineconeKey,
            @Value("${external.pinecone.host:}") String pineconeHost) {
        googleEnabled = googleId != null && googleSecret != null && !googleId.isBlank() && !googleSecret.isBlank();
        judge0Enabled = judge0Url != null && !judge0Url.isBlank();
        openAiEnabled = openAiKey != null && !openAiKey.isBlank();
        pineconeEnabled = pineconeKey != null && !pineconeKey.isBlank() && pineconeHost != null && !pineconeHost.isBlank();
    }

    @GetMapping("/status")
    public Map<String, Object> status() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("googleOAuth", googleEnabled);
        result.put("judge0", judge0Enabled);
        result.put("openAi", openAiEnabled);
        result.put("pineconeRag", pineconeEnabled);
        return result;
    }
}
