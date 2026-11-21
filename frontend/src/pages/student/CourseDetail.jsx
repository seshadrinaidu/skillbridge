import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Play, BookOpen, ChevronDown, ChevronRight, CheckCircle2,
  Lock, Video, FileText, HelpCircle, Clock, Users, Star, Zap,
  ClipboardList, AlertCircle, Calendar, Upload
} from 'lucide-react'
import { courseAPI } from '../../lib/api'
import useAuthStore from '../../store/authStore'

const MOCK_COURSE = {
  id: '1',
  title: 'Data Structures & Algorithms Masterclass',
  description: 'A comprehensive course covering all essential data structures and algorithms needed to ace technical interviews and build efficient software. From arrays to graphs, from sorting to dynamic programming.',
  instructor: 'Dr. Sarah Chen',
  instructorTitle: 'Senior SWE @ Google | PhD CS Stanford',
  difficulty: 'Intermediate',
  duration: '24h',
  lessonCount: 48,
  enrolledCount: 3240,
  rating: 4.8,
  enrolled: true,
  progress: 65,
  whatYouLearn: [
    'Master all fundamental data structures: Arrays, Linked Lists, Trees, Graphs',
    'Understand and implement classic sorting and searching algorithms',
    'Solve dynamic programming problems with confidence',
    'Analyze time and space complexity using Big O notation',
    'Crack FAANG-level coding interviews',
  ],
  prerequisites: ['Basic programming knowledge (any language)', 'Understanding of functions and loops'],
  modules: [
    {
      id: 'm1', title: 'Arrays & Strings', lessonCount: 8, expanded: true,
      lessons: [
        { id: 'l1', title: 'Introduction to Arrays', type: 'video', duration: '12m', completed: true },
        { id: 'l2', title: 'Two Pointer Technique', type: 'video', duration: '18m', completed: true },
        { id: 'l3', title: 'Sliding Window', type: 'reading', duration: '10m', completed: false },
        { id: 'l4', title: 'Quiz: Arrays Basics', type: 'quiz', duration: '15m', completed: false },
      ]
    },
    {
      id: 'm2', title: 'Linked Lists', lessonCount: 6, expanded: false,
      lessons: [
        { id: 'l5', title: 'Singly Linked List', type: 'video', duration: '20m', completed: false },
        { id: 'l6', title: 'Doubly Linked List', type: 'video', duration: '15m', completed: false },
      ]
    },
    {
      id: 'm3', title: 'Trees & BST', lessonCount: 10, expanded: false,
      lessons: [
        { id: 'l7', title: 'Binary Trees', type: 'video', duration: '25m', completed: false },
        { id: 'l8', title: 'Tree Traversal', type: 'video', duration: '20m', completed: false },
      ]
    },
  ],
  assignments: [
    { id: 'a1', title: 'Array Problems Set', dueDate: '2026-11-30', status: 'submitted' },
    { id: 'a2', title: 'Linked List Implementation', dueDate: '2026-12-07', status: 'pending' },
    { id: 'a3', title: 'Tree Traversal Challenge', dueDate: '2026-12-14', status: 'pending' },
  ]
}

const LESSON_ICON = { video: Video, reading: FileText, quiz: HelpCircle, assignment: ClipboardList }
const LESSON_COLOR = { video: 'text-brand-400', reading: 'text-ai-400', quiz: 'text-warning', assignment: 'text-orange-400' }

function LessonRow({ lesson, enrolled, courseId }) {
  const navigate = useNavigate()
  const Icon = LESSON_ICON[lesson.type] || FileText
  const colorClass = LESSON_COLOR[lesson.type] || 'text-text-secondary'

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
        enrolled
          ? 'hover:bg-white/5 cursor-pointer'
          : 'opacity-50 cursor-not-allowed'
      }`}
      onClick={() => enrolled && navigate(`/courses/${courseId}/lessons/${lesson.id}`)}
      role="button"
      tabIndex={enrolled ? 0 : -1}
      onKeyDown={e => e.key === 'Enter' && enrolled && navigate(`/courses/${courseId}/lessons/${lesson.id}`)}
    >
      <Icon size={16} className={colorClass} />
      <span className="flex-1 text-sm text-text-primary">{lesson.title}</span>
      <span className="text-xs text-text-tertiary flex items-center gap-1"><Clock size={11} />{lesson.duration}</span>
      {!enrolled ? (
        <Lock size={14} className="text-text-disabled" />
      ) : lesson.completed ? (
        <CheckCircle2 size={16} className="text-success" />
      ) : (
        <div className="w-4 h-4 rounded-full border border-border-default" />
      )}
    </div>
  )
}

function ModuleAccordion({ module, enrolled, courseId }) {
  const [open, setOpen] = useState(module.expanded)

  return (
    <div className="card-glass overflow-hidden">
      <button
        className="w-full flex items-center gap-3 p-4 hover:bg-white/3 transition-colors"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <ChevronDown size={16} className={`text-text-secondary transition-transform ${open ? '' : '-rotate-90'}`} />
        <span className="font-medium text-text-primary text-sm flex-1 text-left">{module.title}</span>
        <span className="text-xs text-text-tertiary">{module.lessonCount} lessons</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border-subtle px-2 pb-2">
              {module.lessons.map(l => (
                <LessonRow key={l.id} lesson={l} enrolled={enrolled} courseId={courseId} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await courseAPI.get(id)
        setCourse(data)
      } catch (err) {
        if (token?.startsWith('demo-')) setCourse(MOCK_COURSE)
        else setError(err.response?.data?.message || err.message || 'Unable to load this course.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleEnroll = async () => {
    setEnrolling(true)
    try {
      await courseAPI.enroll(id)
      setCourse(c => ({ ...c, enrolled: true }))
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to enroll in this course.')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <div className="page-container py-8">
        <div className="skeleton h-8 w-48 mb-6" />
        <div className="skeleton h-48 w-full mb-4" />
        <div className="skeleton h-6 w-96 mb-2" />
        <div className="skeleton h-4 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container py-16 flex flex-col items-center justify-center gap-4">
        <AlertCircle size={48} className="text-error" />
        <p className="text-text-secondary text-center">{error}</p>
        <button className="btn-primary btn-md" onClick={() => window.location.reload()}>Retry</button>
      </div>
    )
  }

  if (!course) return null

  const TABS = ['overview', 'curriculum', 'assignments']

  return (
    <div className="page-container py-6">
      {/* Back */}
      <button
        onClick={() => navigate('/courses')}
        className="btn-ghost btn-sm mb-6 -ml-1"
        aria-label="Back to catalog"
      >
        <ArrowLeft size={15} /> Back to Catalog
      </button>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-glass p-6 mb-6"
          >
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="badge-brand">{course.topic || 'DSA'}</span>
              <span className="badge-warning">{course.difficulty}</span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">{course.title}</h1>
            <p className="text-text-secondary text-sm leading-relaxed mb-4">{course.description}</p>

            <div className="flex items-center gap-4 text-sm text-text-secondary flex-wrap">
              <span className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center">
                  <Star size={12} className="text-brand-300" />
                </div>
                {course.instructor}
              </span>
              <span className="flex items-center gap-1"><Star size={13} className="text-warning" /> {course.rating}</span>
              <span className="flex items-center gap-1"><Users size={13} /> {course.enrolledCount?.toLocaleString()} students</span>
              <span className="flex items-center gap-1"><Clock size={13} /> {course.duration}</span>
              <span className="flex items-center gap-1"><BookOpen size={13} /> {course.lessonCount} lessons</span>
            </div>

            {/* Progress */}
            {course.enrolled && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-text-secondary mb-1">
                  <span>Your progress</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="progress-bar h-2">
                  <div className="progress-fill h-full" style={{ width: `${course.progress}%` }} />
                </div>
              </div>
            )}

            <div className="mt-4 lg:hidden">
              {course.enrolled ? (
                <button className="btn-md btn-primary" onClick={() => navigate(`/courses/${id}/lessons/l1`)}>
                  <Play size={15} /> Continue Learning
                </button>
              ) : (
                <button className="btn-md btn-primary" onClick={handleEnroll} disabled={enrolling}>
                  {enrolling ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Zap size={15} />}
                  Enroll for Free
                </button>
              )}
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-1 bg-bg-secondary border border-border-subtle rounded-xl p-1 mb-5">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`flex-1 capitalize ${activeTab === t ? 'tab-item-active' : 'tab-item'}`}
                aria-selected={activeTab === t}
                role="tab"
              >
                {t}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="card-glass p-5 mb-4">
                  <h2 className="font-semibold text-text-primary mb-3">What you'll learn</h2>
                  <ul className="space-y-2">
                    {course.whatYouLearn?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                        <CheckCircle2 size={15} className="text-success mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="card-glass p-5">
                  <h2 className="font-semibold text-text-primary mb-3">Prerequisites</h2>
                  <ul className="space-y-2">
                    {course.prerequisites?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                        <ChevronRight size={15} className="text-brand-400 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {activeTab === 'curriculum' && (
              <motion.div key="curriculum" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                {course.modules?.map(m => (
                  <ModuleAccordion key={m.id} module={m} enrolled={course.enrolled} courseId={id} />
                ))}
              </motion.div>
            )}

            {activeTab === 'assignments' && (
              <motion.div key="assignments" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                {course.assignments?.map(a => (
                  <div key={a.id} className="card-glass p-4 flex items-center gap-4">
                    <ClipboardList size={20} className="text-brand-400 shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-text-primary text-sm">{a.title}</p>
                      <p className="text-xs text-text-tertiary flex items-center gap-1 mt-0.5">
                        <Calendar size={11} /> Due {new Date(a.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    {a.status === 'submitted' ? (
                      <span className="badge-success">Submitted</span>
                    ) : (
                      <button
                        className="btn-sm btn-primary"
                        disabled={!course.enrolled}
                      >
                        <Upload size={13} /> Submit
                      </button>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="hidden lg:block w-72 shrink-0"
        >
          <div className="card-glass p-5 sticky top-6">
            <div className="text-center mb-5">
              <p className="text-3xl font-bold gradient-text mb-1">Free</p>
              <p className="text-text-secondary text-xs">Lifetime access</p>
            </div>
            <div className="space-y-2.5 mb-5 text-sm text-text-secondary">
              <div className="flex justify-between">
                <span className="flex items-center gap-1.5"><Clock size={14} /> Duration</span>
                <span className="text-text-primary">{course.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1.5"><BookOpen size={14} /> Lessons</span>
                <span className="text-text-primary">{course.lessonCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1.5"><AlertCircle size={14} /> Difficulty</span>
                <span className="text-text-primary">{course.difficulty}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1.5"><Users size={14} /> Students</span>
                <span className="text-text-primary">{course.enrolledCount?.toLocaleString()}</span>
              </div>
            </div>
            {course.enrolled ? (
              <button
                className="btn-md btn-primary w-full"
                onClick={() => navigate(`/courses/${id}/lessons/l1`)}
              >
                <Play size={15} /> Continue Learning
              </button>
            ) : (
              <button className="btn-md btn-primary w-full" onClick={handleEnroll} disabled={enrolling}>
                {enrolling ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Zap size={15} />}
                Enroll for Free
              </button>
            )}
            <p className="text-text-tertiary text-xs text-center mt-3">No credit card required</p>
          </div>
        </motion.aside>
      </div>
    </div>
  )
}
