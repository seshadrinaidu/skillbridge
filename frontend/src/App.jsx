import React, { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import AppLayout from './components/layout/AppLayout'
import AuthLayout from './components/layout/AuthLayout'
import LoadingScreen from './components/ui/LoadingScreen'

// ── Lazy page imports ─────────────────────────────────────────────────────
const LandingPage      = lazy(() => import('./pages/LandingPage'))
const LoginPage        = lazy(() => import('./pages/auth/LoginPage'))
const RegisterPage     = lazy(() => import('./pages/auth/RegisterPage'))
const OnboardingPage   = lazy(() => import('./pages/auth/OnboardingPage'))
const LogoutPage       = lazy(() => import('./pages/auth/LogoutPage'))
const OAuthCallbackPage = lazy(() => import('./pages/auth/OAuthCallbackPage'))

// Student
const StudentHome      = lazy(() => import('./pages/student/StudentHome'))
const CourseCatalog    = lazy(() => import('./pages/student/CourseCatalog'))
const CourseDetail     = lazy(() => import('./pages/student/CourseDetail'))
const LessonPage       = lazy(() => import('./pages/student/LessonPage'))
const RoadmapPage      = lazy(() => import('./pages/student/RoadmapPage'))
const PracticeWorkspace= lazy(() => import('./pages/student/PracticeWorkspace'))
const MockInterview    = lazy(() => import('./pages/student/MockInterview'))
const PlacementDashboard=lazy(() => import('./pages/student/PlacementDashboard'))
const PerformancePage  = lazy(() => import('./pages/student/PerformancePage'))
const LearningLab      = lazy(() => import('./pages/student/LearningLab'))

// Trainer
const TrainerDashboard = lazy(() => import('./pages/trainer/TrainerDashboard'))
const TrainerCourses   = lazy(() => import('./pages/trainer/TrainerCourses'))
const CourseEditor     = lazy(() => import('./pages/trainer/CourseEditor'))
const StudentProgress  = lazy(() => import('./pages/trainer/StudentProgress'))

// ── Route Guards ───────────────────────────────────────────────────────────
const PrivateRoute = ({ children, role }) => {
  const { user, token, isRestoring } = useAuthStore()
  if (isRestoring) return <LoadingScreen />
  if (!token || !user) return <Navigate to="/login" replace />
  if (role && user?.role !== role) return <Navigate to="/" replace />
  return children
}

const PublicRoute = ({ children }) => {
  const { token, user, isRestoring } = useAuthStore()
  if (isRestoring) return <LoadingScreen />
  if (token && user) {
    const dest = user?.role === 'TRAINER' ? '/trainer' : '/home'
    return <Navigate to={dest} replace />
  }
  return children
}

function App() {
  const restoreSession = useAuthStore(state => state.restoreSession)
  useEffect(() => {
    restoreSession()
  }, [restoreSession])
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route element={<AuthLayout />}>
            <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/logout"   element={<LogoutPage />} />
            <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
          </Route>
          <Route path="/onboarding" element={
            <PrivateRoute role="STUDENT"><OnboardingPage /></PrivateRoute>
          } />

          {/* Student */}
          <Route element={<PrivateRoute role="STUDENT"><AppLayout /></PrivateRoute>}>
            <Route path="/home"            element={<StudentHome />} />
            <Route path="/courses"         element={<CourseCatalog />} />
            <Route path="/courses/:id"     element={<CourseDetail />} />
            <Route path="/courses/:cid/lessons/:lid" element={<LessonPage />} />
            <Route path="/roadmap"         element={<RoadmapPage />} />
            <Route path="/practice"        element={<PracticeWorkspace />} />
            <Route path="/practice/:id"    element={<PracticeWorkspace />} />
            <Route path="/interview"       element={<MockInterview />} />
            <Route path="/interview/:id"   element={<MockInterview />} />
            <Route path="/placement"       element={<PlacementDashboard />} />
            <Route path="/performance"     element={<PerformancePage />} />
            <Route path="/learn"           element={<LearningLab />} />
          </Route>

          {/* Trainer */}
          <Route element={<PrivateRoute role="TRAINER"><AppLayout /></PrivateRoute>}>
            <Route path="/trainer"             element={<TrainerDashboard />} />
            <Route path="/trainer/courses"     element={<TrainerCourses />} />
            <Route path="/trainer/courses/:id" element={<CourseEditor />} />
            <Route path="/trainer/students"    element={<StudentProgress />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
