CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    target_job_role VARCHAR(100),
    experience_level VARCHAR(50),
    weekly_study_hours INT,
    timezone VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0,
    INDEX idx_users_role (role)
) ENGINE=InnoDB;

CREATE TABLE courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    difficulty VARCHAR(20),
    trainer_id BIGINT NOT NULL,
    published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_courses_trainer FOREIGN KEY (trainer_id) REFERENCES users(id),
    INDEX idx_courses_published (published),
    INDEX idx_courses_trainer (trainer_id)
) ENGINE=InnoDB;

CREATE TABLE enrollments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_enrollments_student FOREIGN KEY (student_id) REFERENCES users(id),
    CONSTRAINT fk_enrollments_course FOREIGN KEY (course_id) REFERENCES courses(id),
    CONSTRAINT uk_enrollment_student_course UNIQUE (student_id, course_id)
) ENGINE=InnoDB;
