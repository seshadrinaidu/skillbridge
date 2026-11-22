package com.skillbridge.ai.ai;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RagDocumentRepository extends JpaRepository<RagDocument, Long> {
    Optional<RagDocument> findBySourceKey(String sourceKey);
}
