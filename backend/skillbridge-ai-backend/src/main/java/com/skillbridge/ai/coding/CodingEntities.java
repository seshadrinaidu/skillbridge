package com.skillbridge.ai.coding;

import com.skillbridge.ai.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity @Table(name="coding_problems")
@Getter @Setter
class CodingProblem {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private String title;
    @Column(nullable=false) private String difficulty;
    private String topic;
    @Column(columnDefinition="TEXT") private String statement;
    @Column(name="starter_code",columnDefinition="TEXT") private String starterCode;
    @Column(name="visible_tests_json",columnDefinition="TEXT") private String visibleTestsJson;
    @Column(name="hidden_tests_json",columnDefinition="TEXT") private String hiddenTestsJson;
    private String sampleInput;
    private String sampleOutput;
    @Column(columnDefinition="TEXT") private String constraints;
}

@Entity @Table(name="coding_submissions")
@Getter @Setter
class CodingSubmission {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="student_id") private User student;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="problem_id") private CodingProblem problem;
    @Column(nullable=false) private String language;
    @Column(nullable=false,columnDefinition="TEXT") private String code;
    @Column(nullable=false) private String verdict;
    @Column(name="score_percent") private int scorePercent;
    @Column(columnDefinition="TEXT") private String feedback;
    private Instant submittedAt=Instant.now();
}

@Entity @Table(name="coding_drafts")
@Getter @Setter
class CodingDraft {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="student_id") private User student;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="problem_id") private CodingProblem problem;
    @Column(nullable=false) private String language;
    @Column(columnDefinition="TEXT") private String code;
    private Instant updatedAt=Instant.now();
}
