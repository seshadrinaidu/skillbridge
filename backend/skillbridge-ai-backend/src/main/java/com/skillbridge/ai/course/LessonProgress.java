package com.skillbridge.ai.course;

import com.skillbridge.ai.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(name="lesson_progress")
@Getter @Setter
public class LessonProgress {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false)
    @JoinColumn(name="student_id",nullable=false)
    private User student;
    @ManyToOne(fetch=FetchType.LAZY,optional=false)
    @JoinColumn(name="lesson_id",nullable=false)
    private Lesson lesson;
    private Instant completedAt;
}
