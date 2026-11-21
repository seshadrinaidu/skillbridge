package com.skillbridge.ai.auth;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.skillbridge.ai.user.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class AuthDtos {
    private AuthDtos() {}

    public record RegisterRequest(
            @JsonAlias({"name"}) @NotBlank String fullName,
            @Email @NotBlank String email,
            @Size(min = 8, max = 72) @NotBlank String password,
            @JsonAlias({"targetRole"}) String targetJobRole,
            String experienceLevel,
            @Min(1) Integer weeklyStudyHours,
            @JsonAlias({"timeZone"}) String timezone,
            @NotNull UserRole role
    ) {}

    public record LoginRequest(@Email @NotBlank String email, @Size(min = 8, max = 72) @NotBlank String password) {}

    public record AuthResponse(String accessToken, String tokenType, long expiresInSeconds, UserResponse user) {}

    public record UserResponse(Long id, String fullName, String email, String role,
                               String targetJobRole, String experienceLevel, Integer weeklyStudyHours, String timezone) {}

    public record UpdateUserRequest(
            @NotBlank String fullName,
            String targetJobRole,
            String experienceLevel,
            @Min(1) Integer weeklyStudyHours,
            @NotBlank String timezone
    ) {}
}
