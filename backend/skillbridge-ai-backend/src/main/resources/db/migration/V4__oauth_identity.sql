CREATE TABLE auth_identifiers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    provider VARCHAR(40) NOT NULL,
    provider_subject VARCHAR(255) NOT NULL,
    provider_email VARCHAR(180),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_auth_identifier_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT uk_auth_provider_subject UNIQUE (provider, provider_subject),
    CONSTRAINT uk_auth_user_provider UNIQUE (user_id, provider),
    INDEX idx_auth_identifier_email (provider_email)
) ENGINE=InnoDB;
