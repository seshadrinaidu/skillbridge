package com.skillbridge.ai.coding;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CodingSubmissionRepository extends JpaRepository<CodingSubmission, Long> {
    List<CodingSubmission> findByStudentIdOrderBySubmittedAtDesc(Long studentId);
    List<CodingSubmission> findByStudentIdAndProblemIdOrderBySubmittedAtDesc(Long studentId, Long problemId);
}
