# SkillBridge AI Backend

Production-oriented Spring Boot backend for the SkillBridge AI student learning and placement platform.

## Implemented

- Java 25, Spring Boot 4.0.10, Maven
- MySQL 8 with Flyway migrations
- JWT bearer authentication and BCrypt passwords
- STUDENT/TRAINER/ADMIN roles
- User profile endpoints
- Trainer-owned course CRUD
- Student course enrollment
- Topic-tagged assessments
- Deterministic server-side assessment scoring and persisted performance
- Swagger/OpenAPI and Actuator health
- Phase 1 and application context integration tests

## Prerequisites

- JDK 25
- Maven Wrapper (included)
- MySQL 8

## Local setup

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS skillbridge_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Copy `.env.example` to your shell environment or configure IDE environment variables.

Run:

```bash
./mvnw.cmd spring-boot:run
```

Swagger UI: `http://localhost:8080/swagger-ui.html`

## Testing

```bash
./mvnw.cmd clean verify
```

Tests use H2 and do not require MySQL. Flyway is intentionally disabled in tests.

## Main endpoints

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/users/me`
- `PUT /api/v1/users/me`
- `GET|POST /api/v1/courses`
- `PUT|DELETE /api/v1/courses/{id}`
- `POST /api/v1/enrollments`
- `GET /api/v1/enrollments/me`
- `GET /api/v1/assessments/{id}`
- `POST /api/v1/assessments/{id}/submit`
- `GET /api/v1/performance/me`
- `GET /api/v1/performance/skills`

## Deployment

Set `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, and `CORS_ALLOWED_ORIGINS` in the deployment environment. The production profile must use Flyway and `spring.jpa.hibernate.ddl-auto=validate`. Build with `./mvnw.cmd clean package` and run the generated JAR or Dockerfile.

## Current limitations

- AI roadmap, interview, coding judge, RAG, and readiness endpoints are not yet implemented.
- MySQL startup requires external database credentials and was not verifiable without the local root password.
