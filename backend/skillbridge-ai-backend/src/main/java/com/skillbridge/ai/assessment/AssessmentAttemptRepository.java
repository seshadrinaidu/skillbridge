package com.skillbridge.ai.assessment;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AssessmentAttemptRepository extends JpaRepository<AssessmentAttempt, Long> {
    Optional<AssessmentAttempt> findByStudentIdAndAssessmentId(Long studentId, Long assessmentId);
    List<AssessmentAttempt> findByStudentId(Long studentId);
}
