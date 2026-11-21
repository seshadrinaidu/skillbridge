package com.skillbridge.ai.diagnostic;

import com.skillbridge.ai.exception.ApiException;
import com.skillbridge.ai.user.User;
import com.skillbridge.ai.user.UserRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class DiagnosticController {
    private final UserRepository users;
    private final JdbcTemplate jdbc;
    public DiagnosticController(UserRepository users,JdbcTemplate jdbc){this.users=users;this.jdbc=jdbc;}

    @GetMapping("/assessments/diagnostic")
    public Map<String,Object> questions(){
        return Map.of("questions",List.of(
                Map.of("id",1,"topic","Core Java","question","What collection maintains insertion order?","options",List.of("HashSet","LinkedHashSet","PriorityQueue")),
                Map.of("id",2,"topic","Data Structures","question","Average balanced BST search complexity?","options",List.of("O(1)","O(n)","O(log n)")),
                Map.of("id",3,"topic","Spring Boot","question","Which annotation enables dependency injection?","options",List.of("@Injectable","@Autowired","@Bean")),
                Map.of("id",4,"topic","SQL","question","Which isolation level prevents dirty reads?","options",List.of("Read Uncommitted","Read Committed","Serializable"))
        ));
    }

    @PostMapping("/assessments/diagnostic/submit")
    public Map<String,Object> submit(@RequestBody(required=false) Map<String,Object> body,Authentication authentication){
        User student=currentUser(authentication);
        Map<String,Object> answers=body==null||!(body.get("answers") instanceof Map)?new LinkedHashMap<>(): (Map<String,Object>)body.get("answers");
        int[] correct={1,2,1,1};
        int score=0;
        for(int i=0;i<4;i++) if(Integer.valueOf(String.valueOf(answers.getOrDefault(String.valueOf(i),-1))).equals(correct[i])) score++;
        int percent=score*25;
        String role=body==null?null:String.valueOf(body.getOrDefault("role",student.getTargetJobRole()));
        jdbc.update("INSERT INTO diagnostic_attempts(student_id,target_role,study_hours_per_week,answers_json,score_percent) VALUES(?,?,?,?,?)",
                student.getId(),role,null,String.valueOf(answers),percent);
        return Map.of("scorePercent",percent,"correctAnswers",score,"totalQuestions",4);
    }

    private User currentUser(Authentication authentication){return users.findByEmailIgnoreCase(authentication.getName()).orElseThrow(()->new ApiException(401,"UNAUTHORIZED","Authenticated user not found"));}
}
