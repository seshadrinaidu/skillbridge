package com.skillbridge.ai.interview;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

interface MockInterviewRepository extends JpaRepository<MockInterview,Long> {
    List<MockInterview> findByStudentIdOrderByStartedAtDesc(Long studentId);
}
interface InterviewAnswerRepository extends JpaRepository<InterviewAnswer,Long> {
    List<InterviewAnswer> findByInterviewId(Long interviewId);
}
