import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

// ── Axios instance ──────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor — attach JWT ───────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skillbridge_token')
    if (token?.startsWith('demo-')) {
      return Promise.reject(Object.assign(new Error('Demo mode is local-only. Sign in with a real account to use backend features.'), {
        code: 'DEMO_SESSION',
      }))
    }
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (err) => Promise.reject(err)
)

// ── Response interceptor — handle 401 ─────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('skillbridge_token')
      localStorage.removeItem('skillbridge_user')
      window.dispatchEvent(new CustomEvent('skillbridge:unauthorized'))
    }
    return Promise.reject(err)
  }
)

// ── Auth ───────────────────────────────────────────────────────────────────
export const authAPI = {
  login:          (data) => api.post('/auth/login', data),
  register:       (data) => api.post('/auth/register', data),
  me:             ()     => api.get('/auth/me'),
  logout:         ()     => api.post('/auth/logout'),
  refreshToken:   (data) => api.post('/auth/refresh', data),
}

// ── Users / Profile ────────────────────────────────────────────────────────
export const userAPI = {
  getProfile:     (id)   => api.get(`/users/${id}`),
  updateProfile:  (id, d)=> api.put(`/users/${id}`, d),
  uploadAvatar:   (id, f)=> api.post(`/users/${id}/avatar`, f, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getDashboard:   ()     => api.get('/users/me/dashboard'),
  getStats:       ()     => api.get('/users/me/stats'),
}

// ── Courses ────────────────────────────────────────────────────────────────
export const courseAPI = {
  list:           (p)    => api.get('/courses', { params: p }),
  get:            (id)   => api.get(`/courses/${id}`),
  create:         (d)    => api.post('/courses', d),
  update:         (id,d) => api.put(`/courses/${id}`, d),
  delete:         (id)   => api.delete(`/courses/${id}`),
  enroll:         (id)   => api.post(`/courses/${id}/enroll`),
  unenroll:       (id)   => api.delete(`/courses/${id}/enroll`),
  getLessons:     (id)   => api.get(`/courses/${id}/lessons`),
  getLesson:      (cid,lid)=> api.get(`/courses/${cid}/lessons/${lid}`),
  createLesson:   (id,d) => api.post(`/courses/${id}/lessons`, d),
  updateLesson:   (cid,lid,d)=> api.put(`/courses/${cid}/lessons/${lid}`, d),
  completeLesson: (cid,lid)=> api.post(`/courses/${cid}/lessons/${lid}/complete`),
  getEnrolled:    ()     => api.get('/courses/enrolled'),
  getTrainerCourses: () => api.get('/trainer/courses'),
}

// ── Assessments ────────────────────────────────────────────────────────────
export const assessmentAPI = {
  list:           (p)    => api.get('/assessments', { params: p }),
  get:            (id)   => api.get(`/assessments/${id}`),
  create:         (d)    => api.post('/assessments', d),
  update:         (id,d) => api.put(`/assessments/${id}`, d),
  delete:         (id)   => api.delete(`/assessments/${id}`),
  submit:         (id,d) => api.post(`/assessments/${id}/submit`, d),
  getResult:      (id)   => api.get(`/assessments/${id}/result`),
  getDiagnostic:  ()     => api.get('/assessments/diagnostic'),
  submitDiagnostic:(d)   => api.post('/assessments/diagnostic/submit', d),
}

// ── Student Performance ─────────────────────────────────────────────────────
export const performanceAPI = {
  get:            ()     => api.get('/performance/me'),
  getTopicScores: ()     => api.get('/performance/me/topics'),
  getHistory:     (p)    => api.get('/performance/me/history', { params: p }),
  getWeakAreas:   ()     => api.get('/performance/me/weak-areas'),
  getStreak:      ()     => api.get('/performance/me/streak'),
  getTrainerView: (uid)  => api.get(`/performance/${uid}`),
}

// ── Roadmap ────────────────────────────────────────────────────────────────
export const roadmapAPI = {
  get:            ()     => api.get('/roadmap/me'),
  generate:       (d)    => api.post('/roadmap/generate', d),
  getTasks:       (d)    => api.get('/roadmap/me/tasks', { params: { date: d } }),
  completeTask:   (id)   => api.post(`/roadmap/tasks/${id}/complete`),
  getMilestones:  ()     => api.get('/roadmap/me/milestones'),
  getDailyProblem:()     => api.get('/roadmap/me/daily-problem'),
}

// ── Practice / Problems ────────────────────────────────────────────────────
export const practiceAPI = {
  list:           (p)    => api.get('/problems', { params: p }),
  get:            (id)   => api.get(`/problems/${id}`),
  submit:         (id,d) => api.post(`/problems/${id}/submit`, d),
  run:            (id,d) => api.post(`/problems/${id}/run`, d),
  getHint:        (id,l) => api.get(`/problems/${id}/hints/${l}`),
  getAttempts:    (id)   => api.get(`/problems/${id}/attempts`),
  getAIFeedback:  (id,aid)=> api.get(`/problems/${id}/feedback/${aid}`),
}

// ── Mock Interview ─────────────────────────────────────────────────────────
export const interviewAPI = {
  getSessions:    ()     => api.get('/interviews'),
  createSession:  (d)    => api.post('/interviews', d),
  getSession:     (id)   => api.get(`/interviews/${id}`),
  submitAnswer:   (id,d) => api.post(`/interviews/${id}/answer`, d),
  endSession:     (id)   => api.post(`/interviews/${id}/end`),
  getReport:      (id)   => api.get(`/interviews/${id}/report`),
  getQuestions:   (d)    => api.post('/interviews/questions', d),
}

// ── Placement ──────────────────────────────────────────────────────────────
export const placementAPI = {
  getDashboard:   ()     => api.get('/placement/dashboard'),
  getScore:       ()     => api.get('/placement/score'),
  getRecommendations: ()=> api.get('/placement/recommendations'),
  getReadiness:   ()     => api.get('/placement/readiness'),
}

// ── AI Features ───────────────────────────────────────────────────────────
export const aiAPI = {
  analyzeSkillGap:    (d) => api.post('/ai/skill-gap', d),
  generateRoadmap:    (d) => api.post('/ai/roadmap', d),
  generateQuestions:  (d) => api.post('/ai/interview-questions', d),
  evaluateAnswer:     (d) => api.post('/ai/evaluate-answer', d),
  getHint:            (d) => api.post('/ai/hint', d),
  evaluateCode:       (d) => api.post('/ai/evaluate-code', d),
  getMentorFeedback:  (d) => api.post('/ai/mentor-feedback', d),
  getPlacementReadiness:(d)=> api.post('/ai/placement-readiness', d),
}

// ── Trainer ────────────────────────────────────────────────────────────────
export const trainerAPI = {
  getDashboard:   ()     => api.get('/trainer/dashboard'),
  getStudents:    ()     => api.get('/trainer/students'),
  getStudent:     (id)   => api.get(`/trainer/students/${id}`),
  publishCourse:  (id)   => api.post(`/trainer/courses/${id}/publish`),
  unpublishCourse:(id)   => api.post(`/trainer/courses/${id}/unpublish`),
  createAssignment:(d)   => api.post('/trainer/assignments', d),
  getAssignments: ()     => api.get('/trainer/assignments'),
  gradeSubmission:(id,d) => api.post(`/trainer/submissions/${id}/grade`, d),
}

export default api
