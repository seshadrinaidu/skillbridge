package com.skillbridge.ai.learning;

import com.skillbridge.ai.exception.ApiException;
import com.skillbridge.ai.user.User;
import com.skillbridge.ai.user.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class LearningController {
    private final LearningExerciseRepository exercises;
    private final ExerciseAttemptRepository attempts;
    private final UserRepository users;
    public LearningController(LearningExerciseRepository exercises,ExerciseAttemptRepository attempts,UserRepository users){this.exercises=exercises;this.attempts=attempts;this.users=users;}

    @GetMapping("/exercises")
    public List<Map<String,Object>> list(){
        if(exercises.count()==0){seed(); }
        return exercises.findAll().stream().map(e->Map.of("id",e.getId(),"title",e.getTitle(),"exerciseType",e.getExerciseType(),"topic",e.getTopic()==null?"Java":e.getTopic(),"difficulty",e.getDifficulty()==null?"BEGINNER":e.getDifficulty(),"prompt",e.getPrompt()==null?"":e.getPrompt(),"codeExample",e.getCodeExample()==null?"":e.getCodeExample(),"options",parseOptions(e.getOptionsJson()))).toList();
    }
    @GetMapping("/exercises/{id}")
    public Map<String,Object> get(@PathVariable Long id){
        LearningExercise e=exercises.findById(id).orElseThrow(()->new ApiException(404,"NOT_FOUND","Exercise not found"));
        return Map.of("id",e.getId(),"title",e.getTitle(),"exerciseType",e.getExerciseType(),"topic",e.getTopic()==null?"Java":e.getTopic(),"difficulty",e.getDifficulty()==null?"BEGINNER":e.getDifficulty(),"prompt",e.getPrompt()==null?"":e.getPrompt(),"codeExample",e.getCodeExample()==null?"":e.getCodeExample(),"options",parseOptions(e.getOptionsJson()));
    }
    @PostMapping("/exercises/{id}/submit")
    @Transactional
    public Map<String,Object> submit(@PathVariable Long id,@RequestBody(required=false) Map<String,Object> body,Authentication authentication){
        LearningExercise e=exercises.findById(id).orElseThrow(()->new ApiException(404,"NOT_FOUND","Exercise not found"));
        String answer=body==null?"":String.valueOf(body.getOrDefault("answer",""));
        boolean correct=e.getCorrectAnswer()!=null&&e.getCorrectAnswer().trim().equalsIgnoreCase(answer.trim());
        ExerciseAttempt attempt=new ExerciseAttempt();attempt.setStudent(currentUser(authentication));attempt.setExercise(e);attempt.setSelectedAnswer(answer);attempt.setCorrect(correct);attempts.save(attempt);
        return Map.of("correct",correct,"explanation",e.getExplanation()==null?(correct?"Correct.":"Try again."):e.getExplanation());
    }
    @GetMapping("/exercises/history/me")
    public List<Map<String,Object>> history(Authentication authentication){
        return attempts.findByStudentIdOrderByCompletedAtDesc(currentUser(authentication).getId()).stream().map(a->{
            Map<String,Object> item=new java.util.LinkedHashMap<>();
            item.put("exerciseId",a.getExercise().getId());
            item.put("correct",a.isCorrect());
            item.put("completedAt",a.getCompletedAt()==null?"":a.getCompletedAt().toString());
            return item;
        }).toList();
    }
    private void seed(){
        LearningExercise e1=new LearningExercise();e1.setTitle("Predict Java collection behavior");e1.setExerciseType("OUTPUT_PREDICTION");e1.setTopic("Core Java");e1.setDifficulty("BEGINNER");e1.setPrompt("What is printed?");e1.setCodeExample("Set<Integer> values = new LinkedHashSet<>();\\nvalues.add(3); values.add(1); values.add(3); System.out.println(values);");e1.setOptionsJson("[\"[3, 1, 3]\",\"[3, 1]\",\"[1, 3]\",\"[]\"]");e1.setCorrectAnswer("[3, 1]");e1.setExplanation("LinkedHashSet preserves insertion order and removes duplicates.");exercises.save(e1);
        LearningExercise e2=new LearningExercise();e2.setTitle("Choose the best HashMap operation");e2.setExerciseType("CONCEPT");e2.setTopic("DSA");e2.setDifficulty("BEGINNER");e2.setPrompt("Which operation finds a complement efficiently?");e2.setOptionsJson("[\"containsKey(key)\",\"Search a linked list\",\"Sort then binary search\",\"Nested loop\"]");e2.setCorrectAnswer("containsKey(key)");e2.setExplanation("HashMap average lookup complexity is O(1).");exercises.save(e2);
    }
    private List<String> parseOptions(String json){
        if(json==null||json.length()<2) return List.of();
        String inner=json.substring(1,json.length()-1);
        return java.util.Arrays.stream(inner.split(","))
                .map(s->s.trim().replaceAll("^\"|\"$",""))
                .toList();
    }
    private User currentUser(Authentication authentication){return users.findByEmailIgnoreCase(authentication.getName()).orElseThrow(()->new ApiException(401,"UNAUTHORIZED","Authenticated user not found")); }
}
