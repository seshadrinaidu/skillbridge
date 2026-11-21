package com.skillbridge.ai.course;

import com.skillbridge.ai.exception.ApiException;
import com.skillbridge.ai.user.User;
import com.skillbridge.ai.user.UserRepository;
import com.skillbridge.ai.user.UserRole;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class LessonController {
    private final CourseRepository courses;
    private final LessonRepository lessons;
    private final LessonProgressRepository progress;
    private final UserRepository users;

    public LessonController(CourseRepository courses,LessonRepository lessons,
                            LessonProgressRepository progress,UserRepository users){
        this.courses=courses;this.lessons=lessons;this.progress=progress;this.users=users;
    }

    @GetMapping("/courses/{courseId}/lessons")
    public List<LessonDtos.LessonResponse> list(@PathVariable Long courseId,Authentication authentication){
        User student=authentication==null?null:currentUser(authentication);
        Course course=courses.findById(courseId).orElseThrow(()->new ApiException(404,"NOT_FOUND","Course not found"));
        if(!course.isPublished() && (student==null || !course.getTrainer().getId().equals(student.getId()))) throw new ApiException(404,"NOT_FOUND","Course not found");
        return lessons.findByCourseIdAndPublishedTrueOrderByPositionAsc(courseId).stream().map(l->{
            boolean done=student!=null&&progress.findByStudentIdAndLessonId(student.getId(),l.getId()).map(p->p.getCompletedAt()!=null).orElse(false);
            return new LessonDtos.LessonResponse(l.getId(),l.getTitle(),l.getContent(),l.getPosition(),l.isPublished(),done);
        }).toList();
    }

    @GetMapping("/courses/{courseId}/lessons/{lessonId}")
    public LessonDtos.LessonResponse get(@PathVariable Long courseId,@PathVariable Long lessonId,Authentication authentication){
        return list(courseId,authentication).stream().filter(l->l.id().equals(lessonId)).findFirst()
                .orElseThrow(()->new ApiException(404,"NOT_FOUND","Lesson not found"));
    }

    @PostMapping("/courses/{courseId}/lessons")
    @ResponseStatus(HttpStatus.CREATED)
    public LessonDtos.LessonResponse create(@PathVariable Long courseId,@Valid @RequestBody LessonDtos.LessonRequest request,Authentication authentication){
        User trainer=currentUser(authentication);
        Course course=courses.findById(courseId).orElseThrow(()->new ApiException(404,"NOT_FOUND","Course not found"));
        if(trainer.getRole()!=UserRole.ADMIN&&!course.getTrainer().getId().equals(trainer.getId())) throw new ApiException(403,"FORBIDDEN","Course not owned");
        Lesson lesson=new Lesson();lesson.setCourse(course);lesson.setTitle(request.title());lesson.setContent(request.content());
        lesson.setPosition(request.position()==null?0:request.position());lesson.setPublished(request.published()==null||request.published());
        lesson=lessons.save(lesson);
        return new LessonDtos.LessonResponse(lesson.getId(),lesson.getTitle(),lesson.getContent(),lesson.getPosition(),lesson.isPublished(),false);
    }

    @PutMapping("/courses/{courseId}/lessons/{lessonId}")
    public LessonDtos.LessonResponse update(@PathVariable Long courseId,@PathVariable Long lessonId,
                                            @Valid @RequestBody LessonDtos.LessonRequest request,
                                            Authentication authentication){
        User trainer=currentUser(authentication);
        Course course=courses.findById(courseId).orElseThrow(()->new ApiException(404,"NOT_FOUND","Course not found"));
        if(trainer.getRole()!=UserRole.ADMIN&&!course.getTrainer().getId().equals(trainer.getId()))
            throw new ApiException(403,"FORBIDDEN","Course not owned");
        Lesson lesson=lessons.findById(lessonId).orElseThrow(()->new ApiException(404,"NOT_FOUND","Lesson not found"));
        if(!lesson.getCourse().getId().equals(courseId)) throw new ApiException(404,"NOT_FOUND","Lesson not found");
        lesson.setTitle(request.title());
        lesson.setContent(request.content());
        lesson.setPosition(request.position()==null?lesson.getPosition():request.position());
        lesson.setPublished(request.published()==null?lesson.isPublished():request.published());
        lesson=lessons.save(lesson);
        return new LessonDtos.LessonResponse(lesson.getId(),lesson.getTitle(),lesson.getContent(),lesson.getPosition(),lesson.isPublished(),false);
    }

    @PostMapping("/courses/{courseId}/lessons/{lessonId}/complete")
    public LessonDtos.LessonResponse complete(@PathVariable Long courseId,@PathVariable Long lessonId,Authentication authentication){
        User student=currentUser(authentication);
        Lesson lesson=lessons.findById(lessonId).orElseThrow(()->new ApiException(404,"NOT_FOUND","Lesson not found"));
        if(!lesson.getCourse().getId().equals(courseId)) throw new ApiException(404,"NOT_FOUND","Lesson not found");
        LessonProgress p=progress.findByStudentIdAndLessonId(student.getId(),lessonId).orElseGet(LessonProgress::new);
        p.setStudent(student);p.setLesson(lesson);p.setCompletedAt(Instant.now());progress.save(p);
        return new LessonDtos.LessonResponse(lesson.getId(),lesson.getTitle(),lesson.getContent(),lesson.getPosition(),lesson.isPublished(),true);
    }

    private User currentUser(Authentication authentication){
        if(authentication==null) throw new ApiException(401,"UNAUTHORIZED","Authentication required");
        return users.findByEmailIgnoreCase(authentication.getName()).orElseThrow(()->new ApiException(401,"UNAUTHORIZED","Authenticated user not found"));
    }
}
