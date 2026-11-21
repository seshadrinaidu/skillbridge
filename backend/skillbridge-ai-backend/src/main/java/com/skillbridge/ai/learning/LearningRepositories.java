package com.skillbridge.ai.learning;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

interface LearningExerciseRepository extends JpaRepository<LearningExercise,Long> {
    List<LearningExercise> findByTopicIgnoreCaseAndDifficultyIgnoreCase(String topic,String difficulty);
}
interface ExerciseAttemptRepository extends JpaRepository<ExerciseAttempt,Long> {
    List<ExerciseAttempt> findByStudentIdOrderByCompletedAtDesc(Long studentId);
}
