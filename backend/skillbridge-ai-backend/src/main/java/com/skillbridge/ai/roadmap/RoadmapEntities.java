package com.skillbridge.ai.roadmap;

import com.skillbridge.ai.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name="learning_roadmaps")
@Getter @Setter
class LearningRoadmap {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="student_id") private User student;
    @Column(name="target_role") private String targetRole;
    @Column(nullable=false) private String title;
    @Column(nullable=false) private String status="ACTIVE";
    private Instant createdAt=Instant.now();
    private Instant updatedAt=Instant.now();
    @OneToMany(mappedBy="roadmap",cascade=CascadeType.ALL,orphanRemoval=true)
    private List<RoadmapMilestone> milestones=new ArrayList<>();
}

@Entity @Table(name="roadmap_milestones")
@Getter @Setter
class RoadmapMilestone {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="roadmap_id") private LearningRoadmap roadmap;
    @Column(nullable=false) private String title;
    @Column(columnDefinition="TEXT") private String description;
    @Column(nullable=false) private int position;
    @OneToMany(mappedBy="milestone",cascade=CascadeType.ALL,orphanRemoval=true)
    private List<RoadmapTask> tasks=new ArrayList<>();
}

@Entity @Table(name="roadmap_tasks")
@Getter @Setter
class RoadmapTask {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="milestone_id") private RoadmapMilestone milestone;
    @Column(nullable=false) private String title;
    @Column(name="task_type",nullable=false) private String taskType;
    private LocalDate scheduledDate;
    private Instant completedAt;
}
