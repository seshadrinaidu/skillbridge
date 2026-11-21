package com.skillbridge.ai.roadmap;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

interface LearningRoadmapRepository extends JpaRepository<LearningRoadmap,Long> {
    Optional<LearningRoadmap> findFirstByStudentIdAndStatusOrderByUpdatedAtDesc(Long studentId,String status);
}
interface RoadmapMilestoneRepository extends JpaRepository<RoadmapMilestone,Long> {}
interface RoadmapTaskRepository extends JpaRepository<RoadmapTask,Long> {}
