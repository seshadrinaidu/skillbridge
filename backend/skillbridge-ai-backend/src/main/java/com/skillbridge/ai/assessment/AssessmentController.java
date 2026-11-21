package com.skillbridge.ai.assessment;

import com.skillbridge.ai.exception.ApiException;
import com.skillbridge.ai.user.User;
import com.skillbridge.ai.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class AssessmentController {
    private final AssessmentService service;
    private final UserRepository users;

    public AssessmentController(AssessmentService service,UserRepository users) {
        this.service=service; this.users=users;
    }

    @GetMapping("/assessments/{id}")
    public AssessmentDtos.AssessmentResponse get(@PathVariable Long id) {
        return service.getAssessment(id);
    }

    @PostMapping("/assessments/{id}/submit")
    public AssessmentDtos.SubmitResponse submit(@PathVariable Long id,Authentication authentication,
                                                @Valid @RequestBody AssessmentDtos.SubmitRequest request) {
        return service.submit(id,currentUser(authentication),request);
    }

    @GetMapping("/performance/me")
    public List<AssessmentDtos.PerformanceResponse> performance(Authentication authentication) {
        return service.performance(currentUser(authentication));
    }

    @GetMapping("/performance/skills")
    public List<AssessmentDtos.PerformanceResponse> skills(Authentication authentication) {
        return service.performance(currentUser(authentication));
    }

    @GetMapping("/performance/me/topics")
    public java.util.Map<String,Object> topicScores(Authentication authentication) {
        java.util.List<AssessmentDtos.PerformanceResponse> values=service.performance(currentUser(authentication));
        return java.util.Map.of("topics",values.stream().map(v->java.util.Map.of(
                "topic",v.skill(),"accuracy",v.scorePercent(),"status",v.status())).toList());
    }
    @GetMapping("/performance/me/history")
    public java.util.Map<String,Object> history(Authentication authentication) {
        java.util.List<AssessmentDtos.PerformanceResponse> values=service.performance(currentUser(authentication));
        return java.util.Map.of("history",values.stream().map(v->java.util.Map.of(
                "skill",v.skill(),"score",v.scorePercent(),"attemptCount",v.attemptCount())).toList());
    }
    @GetMapping("/performance/me/weak-areas")
    public java.util.Map<String,Object> weakAreas(Authentication authentication) {
        java.util.List<String> weak=service.performance(currentUser(authentication)).stream()
                .filter(v->v.scorePercent()<60).map(AssessmentDtos.PerformanceResponse::skill).toList();
        return java.util.Map.of("weakAreas",weak);
    }
    @GetMapping("/performance/me/streak")
    public java.util.Map<String,Object> streak(Authentication authentication) {
        return java.util.Map.of("practiceStreak",0,"learningStreak",0);
    }

    private User currentUser(Authentication authentication) {
        return users.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ApiException(401,"UNAUTHORIZED","Authenticated user not found"));
    }
}
