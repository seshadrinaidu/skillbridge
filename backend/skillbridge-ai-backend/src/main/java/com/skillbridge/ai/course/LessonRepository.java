package com.skillbridge.ai.course;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByCourseIdAndPublishedTrueOrderByPositionAsc(Long courseId);
}
