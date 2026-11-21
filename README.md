# SkillBridge — AI-Powered Student Learning & Placement Platform

> VCUBE Hack Quest 1.0 | AI Student Learning Track

---

## 🌐 Live URLs
- **Frontend:** `https://skillbridge-frontend.onrender.com`
- **Backend API:** `https://skillbridge-backend.onrender.com`

---

## 🚀 Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| State | Zustand (persist) |
| Routing | React Router v6 |
| Code Editor | Monaco Editor |
| Charts | Recharts |
| Backend | Java 17, Spring Boot 3, Spring Data JPA |
| Auth | Spring Security + JWT |
| Database | MySQL 8 |
| AI | Spring AI + Gemini / OpenAI LLM API |
| Deployment | Render (frontend + backend) |

---

## 🏗️ Project Structure
```
Skill-Bridge-Generator/
├── frontend/          ← React (this repo section)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── auth/           (Login, Register, Onboarding)
│   │   │   ├── student/        (Home, Courses, Roadmap, Practice, Interview, Placement, Performance)
│   │   │   └── trainer/        (Dashboard, Courses, Editor, Students)
│   │   ├── components/
│   │   │   ├── layout/         (AppLayout, AuthLayout)
│   │   │   └── ui/             (Shared components)
│   │   ├── store/              (Zustand stores)
│   │   └── lib/                (API client, utils, hooks)
└── backend/           ← Spring Boot (separate)
```

---

## 🖥️ Frontend Setup

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Install & Run
```bash
cd frontend
npm install
npm run dev        # → http://localhost:3000
```

### Environment Variables
Create `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=SkillBridge
```

### Production Build
```bash
npm run build      # outputs to frontend/dist/
npm run preview    # preview production build
```

### SPA Routing (Deployment)
For any static host (Render, Netlify, Vercel), add a redirect rule:
- **Render:** `_redirects` file: `/* /index.html 200`
- **Netlify:** `netlify.toml` with `[[redirects]] from="/*" to="/index.html"`

---

## 🤖 AI Features (5 Implemented)
1. **Skill Gap Analyzer** — Diagnostic test → topic scores → weak area detection
2. **Personalized Learning Path** — AI generates role-specific roadmap using student history
3. **Technical Interview Question Generator** — Role + topic → custom question bank
4. **AI Mock Interview Evaluator** — Evaluates answers with evidence from learning history
5. **Placement Readiness Recommendations** — Evidence-based score with actionable next steps

**Bonus:** Personalized Daily Problem of the Day (POTD) selected from active roadmap + history

---

## 🗄️ Database Tables
1. `users` — id, name, email, password_hash, role, target_role, created_at
2. `courses` — id, title, description, trainer_id, difficulty, topics, status, created_at
3. `enrollments` — id, student_id, course_id, enrolled_at, progress, completed_at
4. `assessments` — id, title, course_id, type, questions (JSON), created_at
5. `student_performance` — id, student_id, topic, score, problems_solved, accuracy, updated_at

Additional: `lessons`, `roadmaps`, `roadmap_tasks`, `problems`, `submissions`, `interview_sessions`, `interview_answers`

---

## 📮 API Contract
All endpoints prefixed `/api/`. Auth header: `Authorization: Bearer <JWT>`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Login → `{token, user}` |
| POST | `/auth/register` | Register → `{token, user}` |
| GET | `/roadmap/me` | Student's personalized roadmap |
| GET | `/roadmap/me/daily-problem` | Today's AI-selected problem |
| POST | `/ai/skill-gap` | Analyze skill gaps |
| POST | `/ai/roadmap` | Generate/regenerate roadmap |
| POST | `/problems/:id/submit` | Submit solution |
| POST | `/ai/evaluate-code` | AI code review |
| GET | `/placement/dashboard` | Placement readiness data |
| POST | `/ai/placement-readiness` | AI placement recommendations |

---

## 🎨 Design Principles
- **Dark-first premium UI** — Obsidian backgrounds (#080B12), electric violet brand (#6248FF), AI cyan accent (#00D4D4)
- **Nomu.store inspired** — Radical minimalism, generous spacing, single accent color
- **Accessible** — WCAG AA contrast, keyboard navigation, visible focus rings, semantic HTML
- **Responsive** — Mobile-first with desktop split layouts for the code editor

---

## 🔧 Submission Checklist
- [x] GitHub Repository
- [x] Live Frontend URL
- [x] Live Backend URL
- [x] MySQL Production Database
- [x] ER Diagram (see `/docs/er-diagram.png`)
- [x] Postman Collection (see `/docs/postman-collection.json`)
- [x] README.md (this file)
- [x] ≥ 2 AI Features (5 implemented)
- [x] ≥ 5 Database Tables (8 implemented)

---

*Built with ❤️ for VCUBE Hack Quest 1.0*
