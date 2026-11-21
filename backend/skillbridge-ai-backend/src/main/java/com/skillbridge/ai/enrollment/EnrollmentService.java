package com.skillbridge.ai.enrollment;

import com.skillbridge.ai.course.Course;
import com.skillbridge.ai.course.CourseRepository;
import com.skillbridge.ai.exception.ApiException;
import com.skillbridge.ai.user.User;
import com.skillbridge.ai.user.UserRole;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EnrollmentService {
    private final EnrollmentRepository enrollments;
    private final CourseRepository courses;

    public EnrollmentService(EnrollmentRepository enrollments, CourseRepository courses) {
        this.enrollments = enrollments;
        this.courses = courses;
    }

    @Transactional
    public EnrollmentDtos.EnrollmentResponse enroll(User student, Long courseId) {
        if (student.getRole() != UserRole.STUDENT) {
            throw new ApiException(403, "FORBIDDEN", "Only students may enroll in courses");
        }
        Course course = courses.findById(courseId)
                .orElseThrow(() -> new ApiException(404, "NOT_FOUND", "Course not found"));
        if (!course.isPublished()) {
            throw new ApiException(404, "NOT_FOUND", "Course not found");
        }
        if (enrollments.existsByStudentIdAndCourseId(student.getId(), courseId)) {
            throw new ApiException(409, "CONFLICT", "You are already enrolled in this course");
        }
        Enrollment enrollment = new Enrollment();
        enrollment.setStudent(student);
        enrollment.setCourse(course);
        enrollments.save(enrollment);
        return toResponse(enrollment);
    }

    @Transactional(readOnly = true)
    public List<EnrollmentDtos.EnrollmentResponse> mine(User student) {
        return enrollments.findByStudentIdOrderByEnrolledAtDesc(student.getId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public void unenroll(User student, Long courseId) {
        Enrollment enrollment = enrollments.findByStudentIdAndCourseId(student.getId(), courseId)
                .orElseThrow(() -> new ApiException(404, "NOT_FOUND", "Enrollment not found"));
        enrollments.delete(enrollment);
    }

    private EnrollmentDtos.EnrollmentResponse toResponse(Enrollment enrollment) {
        return new EnrollmentDtos.EnrollmentResponse(enrollment.getId(),
                enrollment.getCourse().getId(), enrollment.getCourse().getTitle(),
                enrollment.getStatus().name(), enrollment.getEnrolledAt().toString());
    }
}
