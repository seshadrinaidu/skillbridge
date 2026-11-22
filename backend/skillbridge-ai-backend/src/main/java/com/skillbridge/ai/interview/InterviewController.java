package com.skillbridge.ai.interview;

import com.skillbridge.ai.exception.ApiException;
import com.skillbridge.ai.user.User;
import com.skillbridge.ai.user.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/interviews")
public class InterviewController {
    private final MockInterviewRepository interviews;
    private final InterviewAnswerRepository answers;
    private final UserRepository users;
    public InterviewController(MockInterviewRepository interviews,InterviewAnswerRepository answers,UserRepository users){this.interviews=interviews;this.answers=answers;this.users=users;}

    @GetMapping
    public List<Map<String,Object>> history(Authentication authentication){
        User student=currentUser(authentication);
        return interviews.findByStudentIdOrderByStartedAtDesc(student.getId()).stream().map(i->{
            Map<String,Object> item=new java.util.LinkedHashMap<>();
            item.put("id",i.getId());
            item.put("targetRole",i.getTargetRole()==null?"Java Backend Developer":i.getTargetRole());
            item.put("mode",i.getMode());
            item.put("status",i.getStatus());
            item.put("scorePercent",i.getScorePercent()==null?0:i.getScorePercent());
            return item;
        }).toList();
    }
    @PostMapping
    @Transactional
    public Map<String,Object> create(@RequestBody(required=false) Map<String,Object> body,Authentication authentication){
        User student=currentUser(authentication);MockInterview interview=new MockInterview();interview.setStudent(student);
        interview.setTargetRole(body==null?student.getTargetJobRole():String.valueOf(body.getOrDefault("targetRole",student.getTargetJobRole())));
        interview.setMode(body==null?"GUIDED":String.valueOf(body.getOrDefault("mode","GUIDED")));
        interview=interviews.save(interview);
        int count=body==null?10:Math.max(1,Math.min(10,Integer.parseInt(String.valueOf(body.getOrDefault("numQuestions",10)))));
        List<Map<String,Object>> questions=questionSet(interview.getTargetRole(),count);
        Map<String,Object> response=new java.util.LinkedHashMap<>();
        response.put("id",interview.getId());
        response.put("targetRole",interview.getTargetRole());
        response.put("mode",interview.getMode());
        response.put("status","ACTIVE");
        response.put("questions",questions);
        return response;
    }

    @PostMapping("/questions")
    public Map<String,Object> questions(@RequestBody(required=false) Map<String,Object> body,Authentication authentication){
        currentUser(authentication);
        int count=body==null?10:Math.max(1,Math.min(10,Integer.parseInt(String.valueOf(body.getOrDefault("numQuestions",10)))));
        String role=body==null?"Java Backend Developer":String.valueOf(body.getOrDefault("targetRole","Java Backend Developer"));
        return Map.of("questions",questionSet(role,count));
    }

    private List<Map<String,Object>> questionSet(String role,int count){
        String[] texts={
                "Explain OOP and describe a real-world use case.",
                "How would you detect a cycle in a linked list?",
                "Explain how you would optimize a slow SQL query.",
                "Design a REST API for course enrollment.",
                "Describe transaction isolation levels and dirty reads.",
                "How would you cache frequently requested data?",
                "Explain Java garbage collection basics.",
                "Compare a stack and a queue.",
                "How would you secure an API with JWT?",
                "Describe trade-offs in microservice communication."
        };
        List<Map<String,Object>> result=new java.util.ArrayList<>();
        for(int i=0;i<count;i++){
            Map<String,Object> item=new java.util.LinkedHashMap<>();
            item.put("id","q-"+(i+1));
            item.put("topic",i%3==0?"Core Concepts":i%3==1?"Data Structures":"System Design");
            item.put("difficulty",i<3?"Easy":i<7?"Medium":"Hard");
            item.put("type","theory");
            item.put("text",texts[i]+" Target role: "+role+".");
            item.put("hint","Use a concrete example and explain trade-offs.");
            result.add(item);
        }
        return result;
    }
    @GetMapping("/{id}")
    public Map<String,Object> get(@PathVariable Long id,Authentication authentication){
        MockInterview i=owned(id,authentication);
        return Map.of("id",i.getId(),"targetRole",i.getTargetRole()==null?"Java Backend Developer":i.getTargetRole(),"mode",i.getMode(),"status",i.getStatus(),"scorePercent",i.getScorePercent()==null?0:i.getScorePercent(),"answers",answers.findByInterviewId(id).stream().map(a->Map.of("questionId",a.getQuestionId()==null?"":a.getQuestionId(),"answer",a.getAnswer()==null?"":a.getAnswer(),"scorePercent",a.getScorePercent()==null?0:a.getScorePercent())).toList());
    }
    @PostMapping("/{id}/answer")
    @Transactional
    public Map<String,Object> answer(@PathVariable Long id,@RequestBody(required=false) Map<String,Object> body,Authentication authentication){
        MockInterview i=owned(id,authentication);InterviewAnswer answer=new InterviewAnswer();answer.setInterview(i);
        answer.setQuestionId(body==null?null:String.valueOf(body.getOrDefault("questionId","")));
        answer.setAnswer(body==null?null:String.valueOf(body.getOrDefault("answer","")));
        answer.setScorePercent(0);answer.setFeedback("Answer saved for interview evaluation.");answers.save(answer);
        return Map.of("saved",true);
    }
    @PostMapping({"/{id}/end","/{id}/complete"})
    @Transactional
    public Map<String,Object> end(@PathVariable Long id,Authentication authentication){
        MockInterview i=owned(id,authentication);i.setStatus("COMPLETED");i.setEndedAt(Instant.now());
        List<InterviewAnswer> list=answers.findByInterviewId(id);int score=list.isEmpty()?0:(int)list.stream().mapToInt(a->a.getScorePercent()==null?0:a.getScorePercent()).average().orElse(0);
        i.setScorePercent(score);interviews.save(i);
        return Map.of("id",i.getId(),"status",i.getStatus(),"scorePercent",score);
    }
    @GetMapping("/{id}/report")
    public Map<String,Object> report(@PathVariable Long id,Authentication authentication){MockInterview i=owned(id,authentication);return Map.of("id",i.getId(),"scorePercent",i.getScorePercent()==null?0:i.getScorePercent(),"status",i.getStatus(),"questions",answers.findByInterviewId(id).size(),"strengths",List.of(),"recommendations",List.of("Practice explanations with concrete examples")); }

    private MockInterview owned(Long id,Authentication authentication){MockInterview i=interviews.findById(id).orElseThrow(()->new ApiException(404,"NOT_FOUND","Interview not found"));if(!i.getStudent().getId().equals(currentUser(authentication).getId()))throw new ApiException(403,"FORBIDDEN","Interview not owned");return i;}
    private User currentUser(Authentication authentication){return users.findByEmailIgnoreCase(authentication.getName()).orElseThrow(()->new ApiException(401,"UNAUTHORIZED","Authenticated user not found")); }
}
