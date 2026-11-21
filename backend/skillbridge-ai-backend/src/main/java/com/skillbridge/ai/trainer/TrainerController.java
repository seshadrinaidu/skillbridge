package com.skillbridge.ai.trainer;

import com.skillbridge.ai.course.Course;
import com.skillbridge.ai.course.CourseRepository;
import com.skillbridge.ai.enrollment.EnrollmentRepository;
import com.skillbridge.ai.exception.ApiException;
import com.skillbridge.ai.user.User;
import com.skillbridge.ai.user.UserRepository;
import com.skillbridge.ai.user.UserRole;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/trainer")
public class TrainerController {
    private final UserRepository users;
    private final CourseRepository courses;
    private final EnrollmentRepository enrollments;
    public TrainerController(UserRepository users,CourseRepository courses,EnrollmentRepository enrollments){this.users=users;this.courses=courses;this.enrollments=enrollments;}

    @GetMapping("/dashboard")
    public Map<String,Object> dashboard(Authentication authentication){
        User trainer=trainer(authentication);java.util.List<Course> owned=courses.findByTrainerIdOrderByCreatedAtDesc(trainer.getId());
        long students=owned.stream().mapToLong(c->enrollments.findAll().stream().filter(e->e.getCourse().getId().equals(c.getId())).count()).sum();
        return Map.of("activeCourses",owned.size(),"enrolledStudents",students,"averagePlacementReadiness",0);
    }
    @GetMapping("/courses")
    public List<Map<String,Object>> courseList(Authentication authentication){
        User trainer=trainer(authentication);
        return courses.findByTrainerIdOrderByCreatedAtDesc(trainer.getId()).stream().map(c->{
            Map<String,Object> item=new java.util.LinkedHashMap<>();
            item.put("id",c.getId());
            item.put("title",c.getTitle());
            item.put("published",c.isPublished());
            item.put("students",enrollments.findAll().stream().filter(e->e.getCourse().getId().equals(c.getId())).count());
            return item;
        }).toList();
    }
    @PostMapping("/courses/{id}/publish")
    public Map<String,Object> publish(@PathVariable Long id,Authentication authentication){return setPublished(id,true,authentication);}
    @PostMapping("/courses/{id}/unpublish")
    public Map<String,Object> unpublish(@PathVariable Long id,Authentication authentication){return setPublished(id,false,authentication);}
    @GetMapping("/students")
    public List<Map<String,Object>> students(Authentication authentication){
        User trainer=trainer(authentication);
        java.util.Set<Long> ids=new java.util.HashSet<>();
        courses.findByTrainerIdOrderByCreatedAtDesc(trainer.getId()).forEach(c->enrollments.findAll().stream().filter(e->e.getCourse().getId().equals(c.getId())).forEach(e->ids.add(e.getStudent().getId())));
        return ids.stream().map(id->{
            Map<String,Object> item=new java.util.LinkedHashMap<>();
            item.put("id",id);
            item.put("readiness",0);
            item.put("weakArea","Insufficient evidence");
            item.put("status","Needs Support");
            return item;
        }).toList();
    }
    @GetMapping("/students/{id}/progress")
    public Map<String,Object> studentProgress(@PathVariable Long id,Authentication authentication){
        User trainer=trainer(authentication);
        User student=users.findById(id).orElseThrow(()->new ApiException(404,"NOT_FOUND","Student not found"));
        boolean authorized= courses.findByTrainerIdOrderByCreatedAtDesc(trainer.getId()).stream()
                .anyMatch(c->enrollments.findAll().stream()
                        .anyMatch(e->e.getCourse().getId().equals(c.getId())&&e.getStudent().getId().equals(student.getId())));
        if(trainer.getRole()!=UserRole.ADMIN&&!authorized) throw new ApiException(403,"FORBIDDEN","Student is not enrolled in one of your courses");
        return Map.of("id",student.getId(),"name",student.getFullName(),"targetRole",student.getTargetJobRole()==null?"Not set":student.getTargetJobRole(),"readiness",0,"status","Insufficient evidence");
    }
    private Map<String,Object> setPublished(Long id,boolean published,Authentication authentication){
        User trainer=trainer(authentication);Course course=courses.findById(id).orElseThrow(()->new ApiException(404,"NOT_FOUND","Course not found"));
        if(trainer.getRole()!=UserRole.ADMIN&&!course.getTrainer().getId().equals(trainer.getId())) throw new ApiException(403,"FORBIDDEN","Course not owned");
        course.setPublished(published);courses.save(course);return Map.of("id",course.getId(),"published",published);
    }
    private User trainer(Authentication authentication){
        if(authentication==null) throw new ApiException(401,"UNAUTHORIZED","Authentication required");
        User user=users.findByEmailIgnoreCase(authentication.getName()).orElseThrow(()->new ApiException(401,"UNAUTHORIZED","Authenticated user not found"));
        if(user.getRole()!=UserRole.TRAINER&&user.getRole()!=UserRole.ADMIN) throw new ApiException(403,"FORBIDDEN","Trainer access required");
        return user;
    }
}
