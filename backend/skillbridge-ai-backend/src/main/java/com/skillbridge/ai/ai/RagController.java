package com.skillbridge.ai.ai;

import com.skillbridge.ai.exception.ApiException;
import com.skillbridge.ai.user.User;
import com.skillbridge.ai.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rag")
public class RagController {
    private final RagDocumentRepository documents;
    private final PineconeRagService rag;
    private final UserRepository users;

    public RagController(RagDocumentRepository documents, PineconeRagService rag, UserRepository users) {
        this.documents = documents;
        this.rag = rag;
        this.users = users;
    }

    @PostMapping("/documents")
    @Transactional
    public Map<String, Object> ingest(@Valid @RequestBody IngestRequest request,
                                      Authentication authentication) {
        User owner = currentUser(authentication);
        RagDocument document = documents.findBySourceKey(request.sourceKey()).orElseGet(RagDocument::new);
        String hash = rag.hash(request.content());
        if (document.getId() != null && hash.equals(document.getContentHash())) {
            return Map.of("id", document.getId(), "unchanged", true);
        }

        String vectorId = document.getVectorId() == null ? "rag-" + UUID.randomUUID() : document.getVectorId();
        rag.upsert(vectorId, request.sourceKey(), request.title(), request.isPublic(),
                request.isPublic() ? null : owner.getId(), request.content(),
                rag.embed(request.content()));

        document.setOwner(request.isPublic() ? null : owner);
        document.setSourceKey(request.sourceKey());
        document.setTitle(request.title());
        document.setContent(request.content());
        document.setContentHash(hash);
        document.setPublic(request.isPublic());
        document.setVectorId(vectorId);
        document.setUpdatedAt(Instant.now());
        document = documents.save(document);
        return Map.of("id", document.getId(), "unchanged", false);
    }

    @DeleteMapping("/documents/{sourceKey}")
    @Transactional
    public Map<String, Object> delete(@PathVariable String sourceKey, Authentication authentication) {
        User requester = currentUser(authentication);
        RagDocument document = documents.findBySourceKey(sourceKey)
                .orElseThrow(() -> new ApiException(404, "NOT_FOUND", "Document not found"));
        if (!document.isPublic() && (document.getOwner() == null
                || !document.getOwner().getId().equals(requester.getId()))) {
            throw new ApiException(403, "FORBIDDEN", "Document is not owned");
        }
        rag.delete(document.getVectorId());
        documents.delete(document);
        return Map.of("deleted", true);
    }

    @PostMapping("/search")
    public Map<String, Object> search(@Valid @RequestBody SearchRequest request,
                                      Authentication authentication) {
        currentUser(authentication);
        throw new ApiException(503, "RAG_UNAVAILABLE",
                "Pinecone semantic search requires the configured retrieval endpoint");
    }

    private User currentUser(Authentication authentication) {
        if (authentication == null) throw new ApiException(401, "UNAUTHORIZED", "Authentication required");
        return users.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ApiException(401, "UNAUTHORIZED", "Authenticated user not found"));
    }

    public record IngestRequest(@NotBlank String sourceKey,
                                @NotBlank String title,
                                @NotBlank String content,
                                boolean isPublic) {}
    public record SearchRequest(@NotBlank String query, Integer limit) {}
}
