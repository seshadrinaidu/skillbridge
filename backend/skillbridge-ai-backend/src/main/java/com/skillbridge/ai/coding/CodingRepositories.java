package com.skillbridge.ai.coding;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

interface CodingProblemRepository extends JpaRepository<CodingProblem,Long> {}
interface CodingSubmissionRepository extends JpaRepository<CodingSubmission,Long> {
    List<CodingSubmission> findByStudentIdOrderBySubmittedAtDesc(Long studentId);
    List<CodingSubmission> findByStudentIdAndProblemIdOrderBySubmittedAtDesc(Long studentId,Long problemId);
}
interface CodingDraftRepository extends JpaRepository<CodingDraft,Long> {
    Optional<CodingDraft> findByStudentIdAndProblemId(Long studentId,Long problemId);
}
