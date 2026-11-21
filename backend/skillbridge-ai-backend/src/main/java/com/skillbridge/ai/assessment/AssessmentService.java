package com.skillbridge.ai.assessment;

import com.skillbridge.ai.exception.ApiException;
import com.skillbridge.ai.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class AssessmentService {
    private final AssessmentRepository assessments;
    private final AssessmentQuestionRepository questions;
    private final AssessmentAttemptRepository attempts;
    private final AssessmentAnswerRepository answers;
    private final StudentPerformanceRepository performances;

    public AssessmentService(AssessmentRepository assessments,
                             AssessmentQuestionRepository questions,
                             AssessmentAttemptRepository attempts,
                             AssessmentAnswerRepository answers,
                             StudentPerformanceRepository performances) {
        this.assessments = assessments;
        this.questions = questions;
        this.attempts = attempts;
        this.answers = answers;
        this.performances = performances;
    }

    @Transactional(readOnly=true)
    public AssessmentDtos.AssessmentResponse getAssessment(Long id) {
        Assessment assessment = assessments.findById(id)
                .filter(Assessment::isPublished)
                .orElseThrow(() -> new ApiException(404,"NOT_FOUND","Assessment not found"));
        List<AssessmentDtos.QuestionResponse> questionDtos = questions.findByAssessmentId(id).stream()
                .map(q -> new AssessmentDtos.QuestionResponse(q.getId(),q.getQuestionText(),q.getQuestionType(),q.getOptions()))
                .toList();
        return new AssessmentDtos.AssessmentResponse(id,assessment.getTitle(),assessment.getDescription(),questionDtos);
    }

    @Transactional
    public AssessmentDtos.SubmitResponse submit(Long assessmentId, User student, AssessmentDtos.SubmitRequest request) {
        Assessment assessment = assessments.findById(assessmentId)
                .filter(Assessment::isPublished)
                .orElseThrow(() -> new ApiException(404,"NOT_FOUND","Assessment not found"));
        if (attempts.findByStudentIdAndAssessmentId(student.getId(),assessmentId).isPresent()) {
            throw new ApiException(409,"CONFLICT","This assessment has already been submitted");
        }
        List<AssessmentQuestion> catalog = questions.findByAssessmentId(assessmentId);
        if (catalog.isEmpty()) throw new ApiException(400,"VALIDATION_ERROR","Assessment has no questions");
        Map<Long,AssessmentQuestion> catalogById = new HashMap<>();
        catalog.forEach(q -> catalogById.put(q.getId(),q));
        Set<Long> submittedIds = new HashSet<>();
        Map<String, int[]> skillTotals = new HashMap<>();
        int correct = 0;

        AssessmentAttempt attempt = new AssessmentAttempt();
        attempt.setStudent(student);
        attempt.setAssessment(assessment);
        attempts.save(attempt);

        for (AssessmentDtos.AnswerRequest answerRequest : request.answers()) {
            AssessmentQuestion question = catalogById.get(answerRequest.questionId());
            if (question == null) throw new ApiException(400,"VALIDATION_ERROR","Question does not belong to this assessment");
            if (!submittedIds.add(question.getId())) throw new ApiException(400,"VALIDATION_ERROR","Duplicate question answer");
            boolean isCorrect = question.getCorrectAnswer().trim().equalsIgnoreCase(answerRequest.answer().trim());
            if (isCorrect) correct++;
            int[] totals = skillTotals.computeIfAbsent(question.getSkillName(), k -> new int[2]);
            totals[0]++;
            if (isCorrect) totals[1]++;

            AssessmentAnswer answer = new AssessmentAnswer();
            answer.setAttempt(attempt);
            answer.setQuestion(question);
            answer.setSelectedAnswer(answerRequest.answer());
            answer.setCorrect(isCorrect);
            answers.save(answer);
        }
        if (submittedIds.size() != catalog.size()) {
            throw new ApiException(400,"VALIDATION_ERROR","Every assessment question must be answered");
        }

        int scorePercent = catalog.isEmpty() ? 0 : (correct * 100) / catalog.size();
        attempt.setScorePercent(scorePercent);
        for (Map.Entry<String,int[]> entry : skillTotals.entrySet()) {
            int skillScore = (entry.getValue()[1] * 100) / entry.getValue()[0];
            StudentPerformance performance = performances
                    .findByStudentIdAndSkillName(student.getId(),entry.getKey())
                    .orElseGet(StudentPerformance::new);
            if (performance.getId() == null) {
                performance.setStudent(student);
                performance.setSkillName(entry.getKey());
                performance.setScorePercent(skillScore);
                performance.setAttemptCount(1);
            } else {
                int previousEvidence = performance.getAttemptCount();
                int weightedAverage = ((performance.getScorePercent() * previousEvidence) + skillScore)
                        / (previousEvidence + 1);
                performance.setScorePercent(weightedAverage);
                performance.setAttemptCount(previousEvidence + 1);
            }
            performance.setUpdatedAt(Instant.now());
            performances.save(performance);
        }
        attempts.save(attempt);
        return new AssessmentDtos.SubmitResponse(attempt.getId(),scorePercent,correct,catalog.size());
    }

    @Transactional(readOnly=true)
    public List<AssessmentDtos.PerformanceResponse> performance(User student) {
        return performances.findByStudentId(student.getId()).stream().map(p ->
                new AssessmentDtos.PerformanceResponse(p.getSkillName(),p.getScorePercent(),p.getAttemptCount(),
                        p.getScorePercent()<50?"WEAK":p.getScorePercent()<70?"DEVELOPING":"STRONG",
                        p.getAttemptCount()<3?"Insufficient evidence; more attempts recommended":"Persisted assessment evidence"))
                .toList();
    }
}
