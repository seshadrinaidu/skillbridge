package com.skillbridge.ai.dashboard;

import com.skillbridge.ai.exception.ApiException;
import com.skillbridge.ai.user.User;
import com.skillbridge.ai.user.UserRepository;
import com.skillbridge.ai.assessment.AssessmentAttemptRepository;
import com.skillbridge.ai.assessment.StudentPerformanceRepository;
import com.skillbridge.ai.course.LessonProgressRepository;
import com.skillbridge.ai.enrollment.EnrollmentRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class DashboardController {
    private final UserRepository users;
    private final EnrollmentRepository enrollments;
    private final LessonProgressRepository lessonProgress;
    private final AssessmentAttemptRepository attempts;
    private final StudentPerformanceRepository performance;

    public DashboardController(UserRepository users,EnrollmentRepository enrollments,
                               LessonProgressRepository lessonProgress,AssessmentAttemptRepository attempts,
                               StudentPerformanceRepository performance){
        this.users=users;this.enrollments=enrollments;this.lessonProgress=lessonProgress;this.attempts=attempts;this.performance=performance;
    }

    @GetMapping("/users/me/stats")
    public Map<String,Object> stats(Authentication authentication){
        User student=currentUser(authentication);
        long completedLessons=lessonProgress.countByStudentIdAndCompletedAtIsNotNull(student.getId());
        int assessmentAttempts=attempts.findByStudentId(student.getId()).size();
        int skills=performance.findByStudentId(student.getId()).size();
        return Map.of("studentId",student.getId(),"enrolledCourses",enrollments.findByStudentIdOrderByEnrolledAtDesc(student.getId()).size(),
                "completedLessons",completedLessons,"assessmentAttempts",assessmentAttempts,"skillsAssessed",skills,
                "practiceStreak",0,"recentSubmissions",java.util.List.of());
    }

    @GetMapping("/users/me/dashboard")
    public Map<String,Object> dashboard(Authentication authentication){
        return Map.of("profile",currentUser(authentication).getFullName(),"stats",stats(authentication),"tasks",java.util.List.of(),"recommendations",java.util.List.of());
    }

    private User currentUser(Authentication authentication){
        if(authentication==null) throw new ApiException(401,"UNAUTHORIZED","Authentication required");
        return users.findByEmailIgnoreCase(authentication.getName()).orElseThrow(()->new ApiException(401,"UNAUTHORIZED","Authenticated user not found"));
    }
}
