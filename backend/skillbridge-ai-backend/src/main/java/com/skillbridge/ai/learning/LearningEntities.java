package com.skillbridge.ai.learning;

import com.skillbridge.ai.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity @Table(name="learning_exercises")
@Getter @Setter
class LearningExercise {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private String title;
    @Column(name="exercise_type",nullable=false) private String exerciseType;
    private String topic;
    private String difficulty;
    @Column(columnDefinition="TEXT") private String prompt;
    @Column(name="code_example",columnDefinition="TEXT") private String codeExample;
    @Column(name="options_json",columnDefinition="TEXT") private String optionsJson;
    @Column(name="correct_answer",columnDefinition="TEXT") private String correctAnswer;
    @Column(columnDefinition="TEXT") private String explanation;
}

@Entity @Table(name="exercise_attempts")
@Getter @Setter
class ExerciseAttempt {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="student_id") private User student;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="exercise_id") private LearningExercise exercise;
    @Column(name="selected_answer",columnDefinition="TEXT") private String selectedAnswer;
    @Column(nullable=false) private boolean correct;
    private Instant completedAt=Instant.now();
}
