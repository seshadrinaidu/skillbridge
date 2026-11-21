package com.skillbridge.ai.interview;

import com.skillbridge.ai.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity @Table(name="mock_interviews")
@Getter @Setter
class MockInterview {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="student_id") private User student;
    @Column(name="target_role") private String targetRole;
    @Column(nullable=false) private String mode;
    @Column(nullable=false) private String status="ACTIVE";
    @Column(name="score_percent") private Integer scorePercent;
    private Instant startedAt=Instant.now();
    private Instant endedAt;
}

@Entity @Table(name="interview_answers")
@Getter @Setter
class InterviewAnswer {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="interview_id") private MockInterview interview;
    @Column(name="question_id") private String questionId;
    @Column(columnDefinition="TEXT") private String answer;
    @Column(name="score_percent") private Integer scorePercent;
    @Column(columnDefinition="TEXT") private String feedback;
    private Instant submittedAt=Instant.now();
}
