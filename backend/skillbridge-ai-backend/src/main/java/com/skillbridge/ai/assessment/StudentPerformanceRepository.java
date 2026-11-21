package com.skillbridge.ai.assessment;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface StudentPerformanceRepository extends JpaRepository<StudentPerformance, Long> {
    List<StudentPerformance> findByStudentId(Long studentId);
    Optional<StudentPerformance> findByStudentIdAndSkillName(Long studentId, String skillName);
}
