package com.skillbridge.ai.auth;

import com.skillbridge.ai.exception.ApiException;
import com.skillbridge.ai.security.JwtService;
import com.skillbridge.ai.user.User;
import com.skillbridge.ai.user.UserRepository;
import com.skillbridge.ai.user.UserRole;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtService jwtService) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {
        if (request.role() != UserRole.STUDENT) {
            throw new ApiException(403, "FORBIDDEN", "Public registration is available only for student accounts");
        }
        if (users.existsByEmailIgnoreCase(request.email().trim())) {
            throw new ApiException(409, "CONFLICT", "An account already exists for this email");
        }
        String timezone = request.timezone() == null || request.timezone().isBlank()
                ? "Asia/Kolkata" : request.timezone().trim();
        validateTimezone(timezone);

        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(request.email().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        user.setTargetJobRole(request.targetJobRole());
        user.setExperienceLevel(request.experienceLevel());
        user.setWeeklyStudyHours(request.weeklyStudyHours());
        user.setTimezone(timezone);
        users.save(user);
        return authResponse(user);
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                    request.email().trim().toLowerCase(), request.password()));
        } catch (AuthenticationException ex) {
            throw new ApiException(401, "UNAUTHORIZED", "Invalid email or password");
        }
        User user = users.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new ApiException(401, "UNAUTHORIZED", "Invalid email or password"));
        return authResponse(user);
    }

    private AuthDtos.AuthResponse authResponse(User user) {
        String token = jwtService.generateToken(user);
        return new AuthDtos.AuthResponse(token, "Bearer", jwtService.getExpirationMs() / 1000,
                toUserResponse(user));
    }

    public AuthDtos.UserResponse toUserResponse(User user) {
        return new AuthDtos.UserResponse(user.getId(), user.getFullName(), user.getEmail(),
                user.getRole().name(), user.getTargetJobRole(), user.getExperienceLevel(),
                user.getWeeklyStudyHours(), user.getTimezone());
    }

    private void validateTimezone(String timezone) {
        try {
            ZoneId.of(timezone);
        } catch (Exception ex) {
            throw new ApiException(400, "VALIDATION_ERROR", "timezone must be a valid IANA timezone");
        }
    }
}
