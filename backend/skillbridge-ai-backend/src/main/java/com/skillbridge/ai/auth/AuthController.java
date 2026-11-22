package com.skillbridge.ai.auth;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Value;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;
    private final com.skillbridge.ai.user.UserRepository users;
    private final String cookieName;

    public AuthController(AuthService authService,
                          com.skillbridge.ai.user.UserRepository users,
                          @Value("${app.auth.cookie-name}") String cookieName) {
        this.authService = authService;
        this.users = users;
        this.cookieName = cookieName;
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
    public void logout(HttpServletResponse response) {
        Cookie cookie = new Cookie(cookieName, "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }

    @GetMapping("/oauth/status")
    public java.util.Map<String, Object> oauthStatus() {
        String clientId = System.getenv("GOOGLE_CLIENT_ID");
        String clientSecret = System.getenv("GOOGLE_CLIENT_SECRET");
        boolean enabled = clientId != null && clientSecret != null
                && !clientId.isBlank() && !clientSecret.isBlank();
        return java.util.Map.of("googleEnabled", enabled);
    }
}
