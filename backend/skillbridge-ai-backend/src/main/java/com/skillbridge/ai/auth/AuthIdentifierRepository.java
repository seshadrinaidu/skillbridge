package com.skillbridge.ai.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuthIdentifierRepository extends JpaRepository<AuthIdentifier, Long> {
    Optional<AuthIdentifier> findByProviderAndProviderSubject(String provider, String providerSubject);
}
