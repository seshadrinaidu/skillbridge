package com.skillbridge.ai.auth;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;
    private final com.skillbridge.ai.user.UserRepository users;

    public AuthController(AuthService authService,
                          com.skillbridge.ai.user.UserRepository users) {
        this.authService = authService;
        this.users = users;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthDtos.AuthResponse register(@Valid @RequestBody AuthDtos.RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthDtos.AuthResponse login(@Valid @RequestBody AuthDtos.LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public com.skillbridge.ai.auth.AuthDtos.UserResponse me(Authentication authentication) {
        if (authentication == null) {
            throw new com.skillbridge.ai.exception.ApiException(401, "UNAUTHORIZED", "Authentication required");
        }
        return authService.toUserResponse(users.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new com.skillbridge.ai.exception.ApiException(401, "UNAUTHORIZED", "Authenticated user not found")));
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout() {
        // Stateless JWT logout is handled by removing the client token.
    }
}
