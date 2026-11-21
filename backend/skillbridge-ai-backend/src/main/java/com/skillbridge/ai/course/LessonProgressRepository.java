package com.skillbridge.ai.course;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {
    Optional<LessonProgress> findByStudentIdAndLessonId(Long studentId, Long lessonId);
    long countByStudentIdAndCompletedAtIsNotNull(Long studentId);
    long countByLessonCourseIdAndCompletedAtIsNotNull(Long courseId);
}
