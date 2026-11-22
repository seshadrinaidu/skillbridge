package com.skillbridge.ai.auth;

import com.skillbridge.ai.security.JwtService;
import com.skillbridge.ai.user.User;
import com.skillbridge.ai.user.UserRepository;
import com.skillbridge.ai.user.UserRole;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Component
public class GoogleOAuthSuccessHandler implements AuthenticationSuccessHandler {
    private final AuthIdentifierRepository authIdentifiers;
    private final UserRepository users;
    private final JwtService jwtService;
    private final String frontendBaseUrl;
    private final String cookieName;

    public GoogleOAuthSuccessHandler(AuthIdentifierRepository authIdentifiers,
                                     UserRepository users,
                                     JwtService jwtService,
                                     @Value("${app.frontend-base-url}") String frontendBaseUrl,
                                     @Value("${app.auth.cookie-name}") String cookieName) {
        this.authIdentifiers = authIdentifiers;
        this.users = users;
        this.jwtService = jwtService;
        this.frontendBaseUrl = frontendBaseUrl;
        this.cookieName = cookieName;
    }

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        if (!(authentication.getPrincipal() instanceof OidcUser oidcUser)) {
            redirectFailure(response, "INVALID_OAUTH_PROVIDER");
            return;
        }

        String subject = oidcUser.getSubject();
        String email = oidcUser.getEmail();
        String name = oidcUser.getFullName();
        Boolean emailVerified = oidcUser.getEmailVerified();

        if (subject == null || subject.isBlank()
                || email == null || email.isBlank()
                || !Boolean.TRUE.equals(emailVerified)) {
            redirectFailure(response, "INVALID_GOOGLE_IDENTITY");
            return;
        }

        email = email.trim().toLowerCase();
        Optional<AuthIdentifier> existing = authIdentifiers.findByProviderAndProviderSubject("google", subject);
        if (existing.isPresent()) {
            completeLogin(request, response, existing.get().getUser());
            return;
        }

        Optional<User> existingUser = users.findByEmailIgnoreCase(email);
        if (existingUser.isPresent()) {
            redirectFailure(response, "EMAIL_ACCOUNT_EXISTS_USE_PASSWORD_LOGIN");
            return;
        }

        User user = new User();
        user.setFullName(name == null || name.isBlank() ? email : name.trim());
        user.setEmail(email);
        user.setPasswordHash("");
        user.setRole(UserRole.STUDENT);
        user.setTargetJobRole(null);
        user.setTimezone("Asia/Kolkata");
        user = users.save(user);

        AuthIdentifier identifier = new AuthIdentifier();
        identifier.setUser(user);
        identifier.setProvider("google");
        identifier.setProviderSubject(subject);
        identifier.setProviderEmail(email);
        authIdentifiers.save(identifier);

        completeLogin(request, response, user);
    }

    private void completeLogin(HttpServletRequest request,
                               HttpServletResponse response,
                               User user) throws IOException {
        String token = jwtService.generateToken(user);
        Cookie cookie = new Cookie(cookieName, token);
        cookie.setHttpOnly(true);
        cookie.setSecure(request.isSecure());
        cookie.setPath("/");
        cookie.setMaxAge((int) (jwtService.getExpirationMs() / 1000));
        response.addCookie(cookie);
        response.sendRedirect(frontendBaseUrl + "/oauth/callback");
    }


    private void redirectFailure(HttpServletResponse response, String reason) throws IOException {
        String encoded = URLEncoder.encode(reason, StandardCharsets.UTF_8);
        response.sendRedirect(frontendBaseUrl + "/oauth/callback?error=" + encoded);
    }
}
