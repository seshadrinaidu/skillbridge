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
        java.util.LinkedHashMap<String,Object> stats=new java.util.LinkedHashMap<>();
        stats.put("studentId",student.getId());
        stats.put("enrolledCourses",enrollments.findByStudentIdOrderByEnrolledAtDesc(student.getId()).size());
        stats.put("completedLessons",completedLessons);
        stats.put("assessmentAttempts",assessmentAttempts);
        stats.put("skillsAssessed",skills);
        stats.put("practiceStreak",0);
        stats.put("streak",0);
        stats.put("problemsSolved",0);
        stats.put("accuracy",0);
        stats.put("timeToday",0);
        stats.put("recentSubmissions",java.util.List.of());
        return stats;
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
