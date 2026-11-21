package com.skillbridge.ai.roadmap;

import com.skillbridge.ai.exception.ApiException;
import com.skillbridge.ai.user.User;
import com.skillbridge.ai.user.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class RoadmapController {
    private final LearningRoadmapRepository roadmaps;
    private final RoadmapTaskRepository tasks;
    private final UserRepository users;
    public RoadmapController(LearningRoadmapRepository roadmaps,RoadmapTaskRepository tasks,UserRepository users){this.roadmaps=roadmaps;this.tasks=tasks;this.users=users;}

    @GetMapping("/roadmap/me")
    @Transactional(readOnly=true)
    public RoadmapDtos.RoadmapResponse me(Authentication authentication){
        User student=currentUser(authentication);
        LearningRoadmap roadmap=roadmaps.findFirstByStudentIdAndStatusOrderByUpdatedAtDesc(student.getId(),"ACTIVE")
                .orElseGet(()->createRoadmap(student,student.getTargetJobRole()));
        return response(roadmap);
    }

    @PostMapping({"/roadmap/generate","/ai/roadmap","/roadmaps/generate"})
    @Transactional
    public RoadmapDtos.RoadmapResponse generate(@RequestBody(required=false) RoadmapDtos.GenerateRequest request,Authentication authentication){
        User student=currentUser(authentication);
        String role=request!=null&&request.targetRole()!=null&&!request.targetRole().isBlank()?request.targetRole():student.getTargetJobRole();
        LearningRoadmap roadmap=roadmaps.findFirstByStudentIdAndStatusOrderByUpdatedAtDesc(student.getId(),"ACTIVE").orElse(null);
        if(roadmap!=null){
            for(RoadmapMilestone milestone:roadmap.getMilestones()) for(RoadmapTask task:milestone.getTasks()) task.setCompletedAt(task.getCompletedAt());
            roadmap.setTargetRole(role);roadmap.setUpdatedAt(Instant.now());
        }else roadmap=createRoadmap(student,role);
        return response(roadmaps.save(roadmap));
    }

    @PostMapping("/roadmap/tasks/{taskId}/complete")
    @Transactional
    public RoadmapDtos.TaskResponse complete(@PathVariable Long taskId,Authentication authentication){
        User student=currentUser(authentication);
        RoadmapTask task=tasks.findById(taskId).orElseThrow(()->new ApiException(404,"NOT_FOUND","Task not found"));
        if(!task.getMilestone().getRoadmap().getStudent().getId().equals(student.getId())) throw new ApiException(403,"FORBIDDEN","Task not owned");
        task.setCompletedAt(task.getCompletedAt()==null?Instant.now():null);
        tasks.save(task);
        return new RoadmapDtos.TaskResponse(task.getId(),task.getTitle(),task.getTaskType(),task.getCompletedAt()!=null);
    }

    @GetMapping("/roadmap/me/tasks")
    public List<RoadmapDtos.TaskResponse> tasks(@RequestParam(required=false) String date, Authentication authentication){
        User student=currentUser(authentication);
        LearningRoadmap roadmap=roadmaps.findFirstByStudentIdAndStatusOrderByUpdatedAtDesc(student.getId(),"ACTIVE")
                .orElseGet(()->createRoadmap(student,student.getTargetJobRole()));
        LocalDate selected=date==null||date.isBlank()?LocalDate.now():LocalDate.parse(date);
        List<RoadmapDtos.TaskResponse> result=new ArrayList<>();
        for(RoadmapMilestone milestone:roadmap.getMilestones()){
            for(RoadmapTask task:milestone.getTasks()){
                if(task.getScheduledDate()==null||task.getScheduledDate().equals(selected)){
                    result.add(new RoadmapDtos.TaskResponse(task.getId(),task.getTitle(),task.getTaskType(),task.getCompletedAt()!=null));
                }
            }
        }
        return result;
    }

    @GetMapping("/roadmap/me/milestones")
    public List<RoadmapDtos.MilestoneResponse> milestones(Authentication authentication){
        User student=currentUser(authentication);
        LearningRoadmap roadmap=roadmaps.findFirstByStudentIdAndStatusOrderByUpdatedAtDesc(student.getId(),"ACTIVE")
                .orElseGet(()->createRoadmap(student,student.getTargetJobRole()));
        return roadmap.getMilestones().stream().map(m->new RoadmapDtos.MilestoneResponse(m.getId(),m.getTitle(),m.getDescription(),
                m.getTasks().stream().map(t->new RoadmapDtos.TaskResponse(t.getId(),t.getTitle(),t.getTaskType(),t.getCompletedAt()!=null)).toList())).toList();
    }

    @GetMapping("/roadmap/me/daily-problem")
    public java.util.Map<String,Object> dailyProblem(Authentication authentication){
        currentUser(authentication);
        return java.util.Map.of("id","daily-java-1","title","Two Sum","difficulty","Easy","topics",List.of("Arrays","HashMap"),
                "xp",100,"timeEstimate","20 min","aiRationale","Recommended from your current roadmap");
    }

    @PatchMapping("/roadmaps/tasks/{taskId}")
    @Transactional
    public RoadmapDtos.TaskResponse patch(@PathVariable Long taskId,@RequestBody(required=false) java.util.Map<String,Object> body,Authentication authentication){
        boolean completed=body!=null&&Boolean.TRUE.equals(body.get("completed"));
        RoadmapTask task=tasks.findById(taskId).orElseThrow(()->new ApiException(404,"NOT_FOUND","Task not found"));
        if(!task.getMilestone().getRoadmap().getStudent().getId().equals(currentUser(authentication).getId())) throw new ApiException(403,"FORBIDDEN","Task not owned");
        task.setCompletedAt(completed?Instant.now():null);tasks.save(task);
        return new RoadmapDtos.TaskResponse(task.getId(),task.getTitle(),task.getTaskType(),completed);
    }

    private LearningRoadmap createRoadmap(User student,String role){
        LearningRoadmap roadmap=new LearningRoadmap();roadmap.setStudent(student);roadmap.setTargetRole(role);roadmap.setTitle("Personalized "+(role==null?"Learning":role)+" Roadmap");
        for(int i=0;i<3;i++){
            RoadmapMilestone milestone=new RoadmapMilestone();milestone.setRoadmap(roadmap);milestone.setPosition(i+1);
            milestone.setTitle(i==0?"Foundations":i==1?"Core practice":"Placement readiness");
            milestone.setDescription(i==0?"Build Java, SQL, and DSA fundamentals":i==1?"Complete guided coding and assessment work":"Prepare projects and mock interviews");
            for(int j=0;j<2;j++){RoadmapTask task=new RoadmapTask();task.setMilestone(milestone);task.setTaskType(j==0?"LEARN":"PRACTICE");task.setScheduledDate(LocalDate.now().plusDays(i*7+j));task.setTitle(i==0?(j==0?"Java fundamentals":"SQL joins"):(i==1?(j==0?"Collections exercises":"Arrays and strings"):(j==0?"Mock interview":"Mini project")));
            milestone.getTasks().add(task);}roadmap.getMilestones().add(milestone);
        }
        return roadmaps.save(roadmap);
    }

    private RoadmapDtos.RoadmapResponse response(LearningRoadmap roadmap){
        List<RoadmapDtos.MilestoneResponse> milestones=new ArrayList<>();
        for(RoadmapMilestone m:roadmap.getMilestones()) milestones.add(new RoadmapDtos.MilestoneResponse(m.getId(),m.getTitle(),m.getDescription(),
                m.getTasks().stream().map(t->new RoadmapDtos.TaskResponse(t.getId(),t.getTitle(),t.getTaskType(),t.getCompletedAt()!=null)).toList()));
        return new RoadmapDtos.RoadmapResponse(roadmap.getId(),roadmap.getTargetRole(),roadmap.getTitle(),milestones);
    }
    private User currentUser(Authentication authentication){return users.findByEmailIgnoreCase(authentication.getName()).orElseThrow(()->new ApiException(401,"UNAUTHORIZED","Authenticated user not found"));}
}
