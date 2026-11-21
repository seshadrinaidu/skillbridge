# SkillBridge AI

**A full-stack AI-assisted student learning and placement preparation platform**

SkillBridge connects a React learning interface with a Spring Boot API to provide course management, diagnostics, personalized roadmaps, coding practice, mock interviews, performance analytics, placement readiness, and trainer monitoring.

---

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [API Reference](#api-reference)
- [Authentication and Authorization](#authentication-and-authorization)
- [Database and Migrations](#database-and-migrations)
- [Testing and Validation](#testing-and-validation)
- [Docker](#docker)
- [Deployment Notes](#deployment-notes)
- [Known Limitations](#known-limitations)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

SkillBridge serves two primary roles:

- **STUDENT**: Uses diagnostics, roadmaps, courses, coding practice, mock interviews, performance data, and placement readiness tools.
- **TRAINER**: Creates and publishes courses, monitors enrolled students, and reviews student progress.

The frontend communicates with the backend through a Vite development proxy. In production, the frontend and backend are expected to be deployed separately or behind a shared reverse proxy.

---

## Technology Stack

| Area | Technology |
|---|---|
| Frontend framework | React 19 |
| Frontend build tool | Vite 8 |
| Routing | React Router DOM 7 |
| State management | Zustand with persistence |
| HTTP client | Axios |
| Styling | Tailwind CSS 4 |
| Charts | Recharts |
| Code editor | Monaco Editor |
| Icons and motion | Lucide React and Framer Motion |
| Backend framework | Java 25, Spring Boot 4.0.10 |
| Backend security | Spring Security, JWT, BCrypt |
| Persistence | Spring Data JPA, Hibernate |
| Database | MySQL 8; H2 for isolated tests |
| Schema management | Flyway |
| API documentation | SpringDoc OpenAPI/Swagger |
| Build tools | npm, Maven Wrapper |

---

## Repository Structure

```text
Skill-Bridge-Generator/
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── layout/
│       │   └── ui/
│       ├── lib/
│       │   ├── api.js
│       │   ├── hooks.js
│       │   └── utils.js
│       ├── pages/
│       │   ├── auth/
│       │   ├── student/
│       │   └── trainer/
│       ├── store/
│       │   └── authStore.js
│       ├── App.jsx
│       └── main.jsx
└── backend/
    └── skillbridge-ai-backend/
        ├── src/main/java/com/skillbridge/ai/
        ├── src/main/resources/
        │   ├── application.properties
        │   └── db/migration/
        ├── src/test/
        ├── Dockerfile
        └── pom.xml
```

---

## Features

### Student Features

- Registration, login, logout, and profile management
- Role-based protected routes
- Student dashboard and daily learning data
- Onboarding diagnostics
- Personalized learning roadmap and daily problem
- Published course catalog and course details
- Course enrollment and unenrollment
- Lesson viewing and lesson-completion persistence
- DSA problem workspace
- Progressive hints and submission feedback
- Mock interview sessions and reports
- Learning Lab exercises
- Performance analytics
- Placement readiness and recommendations

### Trainer Features

- Trainer dashboard
- Trainer-owned course management
- Course publishing and unpublishing
- Enrolled student discovery
- Individual student progress and placement evidence

### Platform Features

- Stateful React route guards
- JWT-protected Spring API
- BCrypt password storage
- Flyway-managed MySQL schema
- Public and authenticated endpoint separation
- Vite `/api` proxy for local development
- Swagger/OpenAPI documentation
- Actuator health endpoint
- Demo mode isolated from real backend authentication

---

## Architecture

```text
Browser
  |
  | http://localhost:3000
  v
React + Vite
  |
  | /api/v1/*
  | Vite development proxy
  v
Spring Boot :8080
  |
  | Spring Data JPA
  v
MySQL
```

### Frontend Flow

- Routes and protected-route rules: [frontend/src/App.jsx](frontend/src/App.jsx)
- Shared Axios API client: [frontend/src/lib/api.js](frontend/src/lib/api.js)
- Authentication state: [frontend/src/store/authStore.js](frontend/src/store/authStore.js)
- Development proxy: [frontend/vite.config.js](frontend/vite.config.js)

The frontend sends all API calls under `/api/v1`. Axios attaches the JWT returned during registration or login and rejects `demo-*` local tokens before they reach the backend.

### Backend Flow

- Application entry point: [SkillbridgeAiBackendApplication.java](backend/skillbridge-ai-backend/src/main/java/com/skillbridge/ai/SkillbridgeAiBackendApplication.java)
- JWT and security configuration: [SecurityConfig.java](backend/skillbridge-ai-backend/src/main/java/com/skillbridge/ai/security/SecurityConfig.java)
- JWT generation: [JwtService.java](backend/skillbridge-ai-backend/src/main/java/com/skillbridge/ai/security/JwtService.java)
- Authentication filter: [JwtAuthenticationFilter.java](backend/skillbridge-ai-backend/src/main/java/com/skillbridge/ai/security/JwtAuthenticationFilter.java)
- Global HTTP errors: [GlobalExceptionHandler.java](backend/skillbridge-ai-backend/src/main/java/com/skillbridge/ai/exception/GlobalExceptionHandler.java)
- Runtime configuration: [application.properties](backend/skillbridge-ai-backend/src/main/resources/application.properties)

---

## Prerequisites

### Required for the frontend

- Node.js 18 or newer
- npm 9 or newer

### Required for the backend

- JDK 25
- Maven Wrapper included in the backend project
- MySQL 8 for production-style local execution

### Optional

- Docker
- OpenAI API credentials
- Pinecone credentials
- A Judge0 or compatible isolated code-execution service

---

## Local Setup

Clone the repository:

```powershell
git clone https://github.com/seshadrinaidu/skillbridge.git
cd skillbridge
```

Install frontend dependencies:

```powershell
cd frontend
npm install
```

Create the frontend environment file:

```powershell
Copy-Item .env.example .env
```

Use this value for local development:

```env
VITE_API_BASE_URL=/api/v1
VITE_APP_NAME=SkillBridge
VITE_APP_VERSION=1.0.0
```

The Vite proxy does not require the browser to call port `8080` directly.

---

## Environment Configuration

### Frontend

Available variables are documented in [frontend/.env.example](frontend/.env.example).

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | API base URL. Use `/api/v1` for the Vite proxy |
| `VITE_APP_NAME` | Display/application name |
| `VITE_APP_VERSION` | Application version |

### Backend

Create a local environment based on [backend/.env.example](backend/skillbridge-ai-backend/.env.example).

| Variable | Purpose |
|---|---|
| `DB_URL` | MySQL JDBC URL |
| `DB_USERNAME` | Database username |
| `DB_PASSWORD` | Database password |
| `JWT_SECRET` | Secret used to sign and verify JWTs |
| `JWT_EXPIRATION_MS` | JWT lifetime in milliseconds |
| `CORS_ALLOWED_ORIGINS` | Comma-separated browser origins |
| `OPENAI_API_KEY` | Optional OpenAI credential |
| `PINECONE_API_KEY` | Optional Pinecone credential |
| `JUDGE0_URL` | Optional isolated code judge URL |
| `JUDGE0_API_KEY` | Optional code judge credential |

Never commit real credentials or JWT secrets.

---

## Running the Application

### Option 1: Run Frontend and Backend Separately

Terminal 1 — Backend:

```powershell
cd backend\skillbridge-ai-backend
.\mvnw.cmd spring-boot:run
```

Terminal 2 — Frontend:

```powershell
cd frontend
npm run dev
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- Health endpoint: http://localhost:8080/actuator/health

### Option 2: Run the Packaged Backend JAR

```powershell
cd backend\skillbridge-ai-backend
.\mvnw.cmd clean package
java -jar target\skillbridge-ai-backend-0.0.1-SNAPSHOT.jar
```

### Isolated H2 Runtime

For an application startup check without MySQL:

```powershell
cd backend\skillbridge-ai-backend
java -jar target\skillbridge-ai-backend-0.0.1-SNAPSHOT.jar ^
  --spring.datasource.url="jdbc:h2:mem:skillbridge;MODE=MySQL;DB_CLOSE_DELAY=-1" ^
  --spring.datasource.username=sa ^
  --spring.datasource.password= ^
  --spring.datasource.driver-class-name=org.h2.Driver ^
  --spring.jpa.hibernate.ddl-auto=create-drop ^
  --spring.flyway.enabled=false ^
  --app.jwt.secret="replace-with-a-local-secret-at-least-32-characters"
```

---

## API Reference

All main application endpoints use the `/api/v1` prefix.

### Authentication

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/v1/auth/register` | Public |
| POST | `/api/v1/auth/login` | Public |
| GET | `/api/v1/auth/me` | Authenticated |
| POST | `/api/v1/auth/logout` | Public/stateless |

### Users

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/v1/users/me` | Authenticated |
| PUT | `/api/v1/users/me` | Authenticated |
| GET | `/api/v1/users/{id}` | Owner/trainer/admin |
| PUT | `/api/v1/users/{id}` | Owner/admin |

### Courses and Lessons

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/v1/courses` | Public |
| GET | `/api/v1/courses/{id}` | Public/auth-aware |
| POST | `/api/v1/courses` | Trainer/admin |
| PUT | `/api/v1/courses/{id}` | Course owner/admin |
| DELETE | `/api/v1/courses/{id}` | Course owner/admin |
| POST | `/api/v1/courses/{id}/enroll` | Student |
| DELETE | `/api/v1/courses/{id}/enroll` | Student |
| GET | `/api/v1/courses/enrolled` | Student |
| GET | `/api/v1/courses/{courseId}/lessons` | Public/auth-aware |
| GET | `/api/v1/courses/{courseId}/lessons/{lessonId}` | Public/auth-aware |
| POST | `/api/v1/courses/{courseId}/lessons` | Trainer/admin |
| PUT | `/api/v1/courses/{courseId}/lessons/{lessonId}` | Trainer/admin |
| POST | `/api/v1/courses/{courseId}/lessons/{lessonId}/complete` | Authenticated |

### Roadmaps and Diagnostics

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/v1/assessments/diagnostic` | Authenticated |
| POST | `/api/v1/assessments/diagnostic/submit` | Authenticated |
| GET | `/api/v1/roadmap/me` | Authenticated |
| POST | `/api/v1/roadmap/generate` | Authenticated |
| GET | `/api/v1/roadmap/me/tasks` | Authenticated |
| POST | `/api/v1/roadmap/tasks/{taskId}/complete` | Authenticated |
| GET | `/api/v1/roadmap/me/milestones` | Authenticated |
| GET | `/api/v1/roadmap/me/daily-problem` | Authenticated |

### Coding Practice

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/v1/problems` | Authenticated |
| GET | `/api/v1/problems/{id}` | Authenticated |
| POST | `/api/v1/problems/{id}/run` | Authenticated |
| POST | `/api/v1/problems/{id}/submit` | Authenticated |
| GET | `/api/v1/problems/{id}/attempts` | Authenticated |
| GET | `/api/v1/problems/{id}/hints/{level}` | Authenticated |

### Interviews and Performance

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/v1/interviews` | Authenticated |
| POST | `/api/v1/interviews` | Authenticated |
| GET | `/api/v1/interviews/{id}` | Authenticated |
| POST | `/api/v1/interviews/{id}/answer` | Authenticated |
| POST | `/api/v1/interviews/{id}/end` | Authenticated |
| GET | `/api/v1/interviews/{id}/report` | Authenticated |
| GET | `/api/v1/performance/me` | Authenticated |
| GET | `/api/v1/performance/me/topics` | Authenticated |
| GET | `/api/v1/performance/me/history` | Authenticated |
| GET | `/api/v1/performance/me/weak-areas` | Authenticated |
| GET | `/api/v1/placement/dashboard` | Authenticated |

### Trainer

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/v1/trainer/dashboard` | Trainer/admin |
| GET | `/api/v1/trainer/courses` | Trainer/admin |
| POST | `/api/v1/trainer/courses/{id}/publish` | Trainer/admin |
| POST | `/api/v1/trainer/courses/{id}/unpublish` | Trainer/admin |
| GET | `/api/v1/trainer/students` | Trainer/admin |
| GET | `/api/v1/trainer/students/{id}/progress` | Trainer/admin |

Swagger UI provides interactive request and response documentation.

---

## Authentication and Authorization

### Registration

Registration accepts:

```json
{
  "fullName": "Student Name",
  "email": "student@example.com",
  "password": "StrongPass123",
  "role": "STUDENT",
  "targetJobRole": "Java Backend Developer",
  "timezone": "Asia/Kolkata"
}
```

Public registration does not allow creating an `ADMIN` account.

### Login

```json
{
  "email": "student@example.com",
  "password": "StrongPass123"
}
```

The response contains:

```json
{
  "accessToken": "<JWT>",
  "tokenType": "Bearer",
  "expiresInSeconds": 3600,
  "user": {}
}
```

Send the JWT with protected requests:

```text
Authorization: Bearer <JWT>
```

### Role Rules

- `STUDENT` routes require student role
- `TRAINER` routes require trainer or administrator role
- Demo users use local `demo-*` tokens and cannot access backend APIs

---

## Database and Migrations

Flyway migrations are located in:

- [V1__phase1_schema.sql](backend/skillbridge-ai-backend/src/main/resources/db/migration/V1__phase1_schema.sql)
- [V2__assessment_schema.sql](backend/skillbridge-ai-backend/src/main/resources/db/migration/V2__assessment_schema.sql)
- [V3__fullstack_integration_schema.sql](backend/skillbridge-ai-backend/src/main/resources/db/migration/V3__fullstack_integration_schema.sql)

Create a local MySQL database:

```sql
CREATE DATABASE IF NOT EXISTS skillbridge_ai
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Configure `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` before starting the backend.

Flyway automatically checks and applies migrations on application startup.

---

## Testing and Validation

### Frontend

```powershell
cd frontend
npm run build
npm run dev
```

The frontend production build writes to `frontend/dist`.

### Backend

```powershell
cd backend\skillbridge-ai-backend
.\mvnw.cmd test
```

Run the complete Maven verification:

```powershell
.\mvnw.cmd clean verify
```

Backend tests use H2 and disable Flyway where appropriate, so tests do not require the local MySQL server.

### Verified Results

At the latest validation:

- Backend integration tests: 5 passed
- Frontend production build: passed
- Backend health endpoint: `UP`
- Student registration: passed
- Student login: passed
- Duplicate registration: HTTP `409`
- Unknown login: HTTP `401`
- Vite proxy registration: passed
- Vite proxy login: passed
- Authenticated `/auth/me`: passed
- Public course listing: passed
- Student/trainer course workflow: passed

---

## Docker

The backend Dockerfile is at [backend/skillbridge-ai-backend/Dockerfile](backend/skillbridge-ai-backend/Dockerfile).

Build and run:

```powershell
cd backend\skillbridge-ai-backend
docker build -t skillbridge-backend .
docker run --rm -p 8080:8080 `
  -e DB_URL="jdbc:mysql://host.docker.internal:3306/skillbridge_ai" `
  -e DB_USERNAME="root" `
  -e DB_PASSWORD="change-me" `
  -e JWT_SECRET="replace-with-a-secret-at-least-32-characters" `
  -e CORS_ALLOWED_ORIGINS="http://localhost:3000" `
  skillbridge-backend
```

The frontend Docker configuration is not yet included.

---

## Deployment Notes

Set these production environment variables for the backend:

- `PORT`
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRATION_MS`
- `CORS_ALLOWED_ORIGINS`

Recommended production frontend configuration:

```env
VITE_API_BASE_URL=https://your-backend-domain/api/v1
```

For static frontend hosting, SPA fallback routes must redirect unknown paths to `index.html`.

The included [frontend/public/_redirects](frontend/public/_redirects) supports compatible static hosts.

---

## Known Limitations

- Live MySQL verification requires local or hosted database credentials.
- Judge0 or another sandbox judge is required for real code execution and verdicts.
- OpenAI credentials are required for external AI-generated responses.
- Pinecone credentials are required for external vector-store features.
- Demo sessions are presentation-only and do not persist real backend data.
- Placement, interview, and performance outputs depend on completed student evidence.

---

## Security

- JWT secrets must be supplied through environment variables.
- Passwords are stored using BCrypt.
- Public registration cannot create `ADMIN` accounts.
- Protected backend routes require JWT authentication.
- User code is not executed inside the Spring Boot JVM.
- `.env` files and build output directories must remain untracked.
- The repository root [.gitignore](.gitignore) excludes dependencies, build results, environment files, IDE files, and logs.

---

## Contributing

1. Create a feature branch.
2. Keep frontend API contracts aligned with backend DTOs.
3. Add or update backend integration tests.
4. Run frontend and backend builds.
5. Never commit secrets or generated build directories.
6. Submit a pull request with verification evidence.

---

## License

License information is not yet defined for this repository. Add a license before distributing the project publicly or commercially.
