package com.skillbridge.ai.assessment;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="assessment_questions")
@Getter @Setter @NoArgsConstructor
public class AssessmentQuestion {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false)
    @JoinColumn(name="assessment_id",nullable=false)
    private Assessment assessment;
    @Column(name="question_text",nullable=false,columnDefinition="TEXT")
    private String questionText;
    @Column(name="question_type",nullable=false,length=30)
    private String questionType;
    @Column(columnDefinition="TEXT")
    private String options;
    @Column(name="correct_answer",nullable=false,columnDefinition="TEXT")
    private String correctAnswer;
    @Column(name="skill_name",nullable=false,length=100)
    private String skillName;
}
