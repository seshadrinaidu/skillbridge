package com.skillbridge.ai.assessment;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name="assessment_answers")
@Getter @Setter
public class AssessmentAnswer {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false)
    @JoinColumn(name="attempt_id",nullable=false)
    private AssessmentAttempt attempt;
    @ManyToOne(fetch=FetchType.LAZY,optional=false)
    @JoinColumn(name="question_id",nullable=false)
    private AssessmentQuestion question;
    @Column(name="selected_answer",columnDefinition="TEXT")
    private String selectedAnswer;
    @Column(nullable=false)
    private boolean correct;
}
