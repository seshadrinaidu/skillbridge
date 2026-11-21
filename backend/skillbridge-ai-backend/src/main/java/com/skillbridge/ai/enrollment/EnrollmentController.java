package com.skillbridge.ai.enrollment;

import com.skillbridge.ai.exception.ApiException;
import com.skillbridge.ai.user.User;
import com.skillbridge.ai.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/enrollments")
public class EnrollmentController {
    private final EnrollmentService enrollmentService;
    private final UserRepository users;

    public EnrollmentController(EnrollmentService enrollmentService, UserRepository users) {
        this.enrollmentService = enrollmentService;
        this.users = users;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EnrollmentDtos.EnrollmentResponse enroll(Authentication authentication,
                                                    @Valid @RequestBody EnrollmentDtos.EnrollRequest request) {
        return enrollmentService.enroll(currentUser(authentication), request.courseId());
    }

    @GetMapping("/me")
    public List<EnrollmentDtos.EnrollmentResponse> mine(Authentication authentication) {
        return enrollmentService.mine(currentUser(authentication));
    }


    private User currentUser(Authentication authentication) {
        return users.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ApiException(401, "UNAUTHORIZED", "Authenticated user not found"));
    }
}
