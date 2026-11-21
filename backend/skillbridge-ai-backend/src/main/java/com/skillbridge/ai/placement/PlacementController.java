package com.skillbridge.ai.placement;

import com.skillbridge.ai.assessment.AssessmentAttemptRepository;
import com.skillbridge.ai.assessment.StudentPerformanceRepository;
import com.skillbridge.ai.exception.ApiException;
import com.skillbridge.ai.user.User;
import com.skillbridge.ai.user.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/placement")
public class PlacementController {
    private final UserRepository users;
    private final StudentPerformanceRepository performance;
    private final AssessmentAttemptRepository attempts;
    public PlacementController(UserRepository users,StudentPerformanceRepository performance,AssessmentAttemptRepository attempts){this.users=users;this.performance=performance;this.attempts=attempts;}

    @GetMapping({"/dashboard","/score","/readiness"})
    public Map<String,Object> dashboard(Authentication authentication){
        User student=currentUser(authentication);
        var scores=performance.findByStudentId(student.getId());
        int assessmentScore=scores.isEmpty()?0:(int)scores.stream().mapToInt(p->p.getScorePercent()).average().orElse(0);
        int codingScore=0;
        int interviewScore=0;
        int courseScore=0;
        int evidenceCount=scores.size()+attempts.findByStudentId(student.getId()).size();
        int overall=evidenceCount==0?0:(assessmentScore*30+codingScore*30+interviewScore*25+courseScore*15)/100;
        return Map.of("overallScore",overall,"assessmentScore",assessmentScore,"codingScore",codingScore,
                "interviewScore",interviewScore,"courseScore",courseScore,"evidenceCount",evidenceCount,
                "missingEvidence",evidenceCount==0?List.of("Assessments","Coding practice","Mock interviews","Projects"):List.of(),
                "recommendations",List.of("Complete an assessment","Solve daily coding problems","Schedule a mock interview"));
    }
    @GetMapping("/recommendations")
    public Map<String,Object> recommendations(Authentication authentication){
        Map<String,Object> dashboard=dashboard(authentication);
        return Map.of("recommendations",dashboard.get("recommendations"),"missingEvidence",dashboard.get("missingEvidence"));
    }
    private User currentUser(Authentication authentication){return users.findByEmailIgnoreCase(authentication.getName()).orElseThrow(()->new ApiException(401,"UNAUTHORIZED","Authenticated user not found")); }
}
