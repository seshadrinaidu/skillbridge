CREATE TABLE rag_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id BIGINT NULL,
    source_key VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content MEDIUMTEXT NOT NULL,
    content_hash VARCHAR(64) NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    vector_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_rag_owner FOREIGN KEY (owner_id) REFERENCES users(id),
    CONSTRAINT uk_rag_source_key UNIQUE (source_key),
    INDEX idx_rag_owner_public (owner_id, is_public)
) ENGINE=InnoDB;
