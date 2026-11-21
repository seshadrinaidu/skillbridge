package com.skillbridge.ai.course;

import com.skillbridge.ai.exception.ApiException;
import com.skillbridge.ai.user.User;
import com.skillbridge.ai.user.UserRepository;
import com.skillbridge.ai.enrollment.EnrollmentDtos;
import com.skillbridge.ai.enrollment.EnrollmentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/courses")
public class CourseController {
    private final CourseService courseService;
    private final UserRepository users;
    private final EnrollmentService enrollmentService;

    public CourseController(CourseService courseService, UserRepository users,
                            EnrollmentService enrollmentService) {
        this.courseService = courseService;
        this.users = users;
        this.enrollmentService = enrollmentService;
    }

    @GetMapping
    public Page<CourseDtos.CourseResponse> list(Pageable pageable) {
        return courseService.publishedCourses(pageable);
    }

    @GetMapping("/{id}")
    public CourseDtos.CourseResponse get(@PathVariable Long id, Authentication authentication) {
        User requester = authentication == null ? null : currentUser(authentication);
        return courseService.getPublishedOrAuthorized(id, requester);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CourseDtos.CourseResponse create(Authentication authentication,
                                            @Valid @RequestBody CourseDtos.CourseRequest request) {
        return courseService.create(request, currentUser(authentication));
    }

    @PutMapping("/{id}")
    public CourseDtos.CourseResponse update(@PathVariable Long id, Authentication authentication,
                                            @Valid @RequestBody CourseDtos.CourseRequest request) {
        return courseService.update(id, request, currentUser(authentication));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication authentication) {
        courseService.delete(id, currentUser(authentication));
    }

    @PostMapping("/{id}/enroll")
    @ResponseStatus(HttpStatus.CREATED)
    public EnrollmentDtos.EnrollmentResponse enroll(@PathVariable Long id,
                                                    Authentication authentication) {
        return enrollmentService.enroll(currentUser(authentication), id);
    }

    @DeleteMapping("/{id}/enroll")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unenroll(@PathVariable Long id, Authentication authentication) {
        enrollmentService.unenroll(currentUser(authentication), id);
    }

    @GetMapping("/enrolled")
    public java.util.List<EnrollmentDtos.EnrollmentResponse> enrolled(Authentication authentication) {
        return enrollmentService.mine(currentUser(authentication));
    }

    private User currentUser(Authentication authentication) {
        if (authentication == null) {
            throw new ApiException(401, "UNAUTHORIZED", "Authentication required");
        }
        return users.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ApiException(401, "UNAUTHORIZED", "Authenticated user not found"));
    }
}
