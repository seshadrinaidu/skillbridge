CREATE TABLE lessons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    position INT NOT NULL DEFAULT 0,
    published BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_lessons_course FOREIGN KEY (course_id) REFERENCES courses(id),
    UNIQUE KEY uk_lesson_course_position (course_id, position),
    INDEX idx_lessons_course (course_id)
) ENGINE=InnoDB;

CREATE TABLE lesson_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    lesson_id BIGINT NOT NULL,
    completed_at TIMESTAMP NULL,
    CONSTRAINT fk_lesson_progress_student FOREIGN KEY (student_id) REFERENCES users(id),
    CONSTRAINT fk_lesson_progress_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id),
    UNIQUE KEY uk_lesson_progress (student_id, lesson_id)
) ENGINE=InnoDB;

CREATE TABLE diagnostic_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    target_role VARCHAR(100),
    study_hours_per_week INT,
    answers_json TEXT,
    score_percent INT NOT NULL,
    completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_diagnostic_student FOREIGN KEY (student_id) REFERENCES users(id),
    INDEX idx_diagnostic_student (student_id)
) ENGINE=InnoDB;

CREATE TABLE learning_roadmaps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    target_role VARCHAR(100),
    title VARCHAR(200) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_roadmap_student FOREIGN KEY (student_id) REFERENCES users(id),
    INDEX idx_roadmap_student_status (student_id,status)
) ENGINE=InnoDB;

CREATE TABLE roadmap_milestones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    roadmap_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    position INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_milestone_roadmap FOREIGN KEY (roadmap_id) REFERENCES learning_roadmaps(id),
    INDEX idx_milestone_roadmap (roadmap_id)
) ENGINE=InnoDB;

CREATE TABLE roadmap_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    milestone_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    task_type VARCHAR(30) NOT NULL,
    scheduled_date DATE,
    completed_at TIMESTAMP NULL,
    CONSTRAINT fk_task_milestone FOREIGN KEY (milestone_id) REFERENCES roadmap_milestones(id),
    INDEX idx_task_milestone_date (milestone_id,scheduled_date)
) ENGINE=InnoDB;

CREATE TABLE coding_problems (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    topic VARCHAR(100),
    statement TEXT,
    starter_code TEXT,
    visible_tests_json TEXT,
    hidden_tests_json TEXT,
    sample_input TEXT,
    sample_output TEXT,
    constraints TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_problem_topic_difficulty (topic,difficulty)
) ENGINE=InnoDB;

CREATE TABLE coding_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    problem_id BIGINT NOT NULL,
    language VARCHAR(30) NOT NULL,
    code TEXT NOT NULL,
    verdict VARCHAR(30) NOT NULL,
    score_percent INT NOT NULL DEFAULT 0,
    feedback TEXT,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_submission_student FOREIGN KEY (student_id) REFERENCES users(id),
    CONSTRAINT fk_submission_problem FOREIGN KEY (problem_id) REFERENCES coding_problems(id),
    INDEX idx_submission_student_problem (student_id,problem_id)
) ENGINE=InnoDB;

CREATE TABLE coding_drafts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    problem_id BIGINT NOT NULL,
    language VARCHAR(30) NOT NULL,
    code TEXT,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_draft_student FOREIGN KEY (student_id) REFERENCES users(id),
    CONSTRAINT fk_draft_problem FOREIGN KEY (problem_id) REFERENCES coding_problems(id),
    UNIQUE KEY uk_draft_student_problem (student_id,problem_id)
) ENGINE=InnoDB;

CREATE TABLE mock_interviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    target_role VARCHAR(100),
    mode VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    score_percent INT,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP NULL,
    CONSTRAINT fk_interview_student FOREIGN KEY (student_id) REFERENCES users(id),
    INDEX idx_interview_student_status (student_id,status)
) ENGINE=InnoDB;

CREATE TABLE interview_answers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    interview_id BIGINT NOT NULL,
    question_id VARCHAR(100),
    answer TEXT,
    score_percent INT,
    feedback TEXT,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_answer_interview FOREIGN KEY (interview_id) REFERENCES mock_interviews(id),
    INDEX idx_answer_interview (interview_id)
) ENGINE=InnoDB;

CREATE TABLE learning_exercises (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    exercise_type VARCHAR(30) NOT NULL,
    topic VARCHAR(100),
    difficulty VARCHAR(20),
    prompt TEXT,
    code_example TEXT,
    options_json TEXT,
    correct_answer TEXT,
    explanation TEXT
) ENGINE=InnoDB;

CREATE TABLE exercise_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    exercise_id BIGINT NOT NULL,
    selected_answer TEXT,
    correct BOOLEAN NOT NULL,
    completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_exercise_attempt_student FOREIGN KEY (student_id) REFERENCES users(id),
    CONSTRAINT fk_exercise_attempt_exercise FOREIGN KEY (exercise_id) REFERENCES learning_exercises(id),
    INDEX idx_exercise_attempt_student (student_id,exercise_id)
) ENGINE=InnoDB;
