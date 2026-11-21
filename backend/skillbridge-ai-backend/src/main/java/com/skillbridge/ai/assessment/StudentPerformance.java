package com.skillbridge.ai.assessment;

import com.skillbridge.ai.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(name="student_performance")
@Getter @Setter
public class StudentPerformance {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false)
    @JoinColumn(name="student_id",nullable=false)
    private User student;
    @Column(name="skill_name",nullable=false,length=100)
    private String skillName;
    @Column(name="score_percent",nullable=false)
    private int scorePercent;
    @Column(name="attempt_count",nullable=false)
    private int attemptCount = 1;
    @Column(name="updated_at",nullable=false)
    private Instant updatedAt = Instant.now();
}
