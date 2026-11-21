package com.skillbridge.ai.enrollment;

import com.skillbridge.ai.course.Course;
import com.skillbridge.ai.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "enrollments",
        uniqueConstraints = @UniqueConstraint(name = "uk_enrollment_student_course",
                columnNames = {"student_id", "course_id"}))
@Getter
@Setter
@NoArgsConstructor
public class Enrollment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false, updatable = false)
    private Instant enrolledAt = Instant.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EnrollmentStatus status = EnrollmentStatus.ACTIVE;

    @Version
    private long version;
}
