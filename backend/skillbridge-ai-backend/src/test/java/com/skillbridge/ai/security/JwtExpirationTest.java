package com.skillbridge.ai.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtExpirationTest {
    private final JwtService jwtService = new JwtService(
            "test-secret-key-that-is-at-least-32-characters",
            3600000,
            "skillbridge-ai-test");

    @Test
    void expiredTokenIsRejected() {
        String expiredToken = Jwts.builder()
                .subject("student@example.com")
                .issuer("skillbridge-ai-test")
                .expiration(new Date(System.currentTimeMillis() - 60000))
                .signWith(Keys.hmacShaKeyFor(
                        "test-secret-key-that-is-at-least-32-characters".getBytes(StandardCharsets.UTF_8)))
                .compact();

        assertThrows(ExpiredJwtException.class, () -> jwtService.parseClaims(expiredToken));
    }
}
