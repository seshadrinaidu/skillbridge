package com.skillbridge.ai.user;

import com.skillbridge.ai.auth.AuthDtos;
import com.skillbridge.ai.auth.AuthService;
import com.skillbridge.ai.exception.ApiException;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.ZoneId;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    private final UserRepository users;
    private final AuthService authService;

    public UserController(UserRepository users, AuthService authService) {
        this.users = users;
        this.authService = authService;
    }

    @GetMapping("/me")
    public AuthDtos.UserResponse me(Authentication authentication) {
        return authService.toUserResponse(currentUser(authentication));
    }

    @PutMapping("/me")
    public AuthDtos.UserResponse updateMe(Authentication authentication,
                                          @Valid @RequestBody AuthDtos.UpdateUserRequest request) {
        User user = currentUser(authentication);
        try {
            ZoneId.of(request.timezone());
        } catch (Exception ex) {
            throw new ApiException(400, "VALIDATION_ERROR", "timezone must be a valid IANA timezone");
        }
        user.setFullName(request.fullName().trim());
        user.setTargetJobRole(request.targetJobRole());
        user.setExperienceLevel(request.experienceLevel());
        user.setWeeklyStudyHours(request.weeklyStudyHours());
        user.setTimezone(request.timezone().trim());
        return authService.toUserResponse(users.save(user));
    }

    @GetMapping("/{id}")
    public AuthDtos.UserResponse getProfile(@PathVariable Long id, Authentication authentication) {
        User requester=currentUser(authentication);
        if(requester.getRole()!=com.skillbridge.ai.user.UserRole.ADMIN
                &&!requester.getId().equals(id)
                &&requester.getRole()!=com.skillbridge.ai.user.UserRole.TRAINER) {
            throw new ApiException(403,"FORBIDDEN","Profile access denied");
        }
        return authService.toUserResponse(users.findById(id)
                .orElseThrow(()->new ApiException(404,"NOT_FOUND","User not found")));
    }

    @PutMapping("/{id}")
    public AuthDtos.UserResponse updateProfile(@PathVariable Long id, Authentication authentication,
                                               @Valid @RequestBody AuthDtos.UpdateUserRequest request) {
        User requester=currentUser(authentication);
        if(requester.getRole()!=com.skillbridge.ai.user.UserRole.ADMIN&&!requester.getId().equals(id))
            throw new ApiException(403,"FORBIDDEN","Profile access denied");
        try { ZoneId.of(request.timezone()); }
        catch(Exception ex) { throw new ApiException(400,"VALIDATION_ERROR","timezone must be a valid IANA timezone"); }
        User user=users.findById(id).orElseThrow(()->new ApiException(404,"NOT_FOUND","User not found"));
        user.setFullName(request.fullName().trim());
        user.setTargetJobRole(request.targetJobRole());
        user.setExperienceLevel(request.experienceLevel());
        user.setWeeklyStudyHours(request.weeklyStudyHours());
        user.setTimezone(request.timezone().trim());
        return authService.toUserResponse(users.save(user));
    }

    private User currentUser(Authentication authentication) {
        return users.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ApiException(401, "UNAUTHORIZED", "Authenticated user not found"));
    }
}
