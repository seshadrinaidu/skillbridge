package com.skillbridge.ai.assessment;

import com.skillbridge.ai.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(name="assessment_attempts")
@Getter @Setter
public class AssessmentAttempt {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false)
    @JoinColumn(name="student_id",nullable=false)
    private User student;
    @ManyToOne(fetch=FetchType.LAZY,optional=false)
    @JoinColumn(name="assessment_id",nullable=false)
    private Assessment assessment;
    @Column(name="score_percent",nullable=false)
    private int scorePercent;
    @Column(name="completed_at",nullable=false)
    private Instant completedAt = Instant.now();
}
