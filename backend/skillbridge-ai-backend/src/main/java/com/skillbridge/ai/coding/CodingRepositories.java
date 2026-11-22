package com.skillbridge.ai.coding;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

interface CodingProblemRepository extends JpaRepository<CodingProblem,Long> {}
interface CodingDraftRepository extends JpaRepository<CodingDraft,Long> {
    Optional<CodingDraft> findByStudentIdAndProblemId(Long studentId,Long problemId);
}
