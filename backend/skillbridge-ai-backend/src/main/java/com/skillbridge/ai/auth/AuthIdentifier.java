package com.skillbridge.ai.auth;

import com.skillbridge.ai.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "auth_identifiers",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_auth_provider_subject", columnNames = {"provider", "provider_subject"}),
                @UniqueConstraint(name = "uk_auth_user_provider", columnNames = {"user_id", "provider"})
        })
@Getter
@Setter
@NoArgsConstructor
public class AuthIdentifier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 40)
    private String provider;

    @Column(name = "provider_subject", nullable = false, length = 255)
    private String providerSubject;

    @Column(name = "provider_email", length = 180)
    private String providerEmail;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
