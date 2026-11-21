CREATE TABLE assessments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE assessment_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assessment_id BIGINT NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(30) NOT NULL,
    options TEXT,
    correct_answer TEXT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    CONSTRAINT fk_questions_assessment FOREIGN KEY (assessment_id) REFERENCES assessments(id),
    INDEX idx_questions_assessment (assessment_id)
) ENGINE=InnoDB;

CREATE TABLE assessment_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    assessment_id BIGINT NOT NULL,
    score_percent INT NOT NULL,
    completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attempt_student FOREIGN KEY (student_id) REFERENCES users(id),
    CONSTRAINT fk_attempt_assessment FOREIGN KEY (assessment_id) REFERENCES assessments(id),
    UNIQUE KEY uk_attempt_student_assessment (student_id, assessment_id),
    INDEX idx_attempt_student (student_id)
) ENGINE=InnoDB;

CREATE TABLE assessment_answers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    attempt_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    selected_answer TEXT,
    correct BOOLEAN NOT NULL,
    CONSTRAINT fk_answer_attempt FOREIGN KEY (attempt_id) REFERENCES assessment_attempts(id),
    CONSTRAINT fk_answer_question FOREIGN KEY (question_id) REFERENCES assessment_questions(id),
    UNIQUE KEY uk_answer_attempt_question (attempt_id, question_id)
) ENGINE=InnoDB;

CREATE TABLE student_performance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    score_percent INT NOT NULL,
    attempt_count INT NOT NULL DEFAULT 1,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_performance_student FOREIGN KEY (student_id) REFERENCES users(id),
    UNIQUE KEY uk_performance_student_skill (student_id, skill_name)
) ENGINE=InnoDB;
