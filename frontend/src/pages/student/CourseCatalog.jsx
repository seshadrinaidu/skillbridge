import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Search, BookOpen, Clock, Users, ChevronRight, Filter,
  Code, Database, Globe, Cpu, TrendingUp, CheckCircle2,
  Play, Lock, Star, Zap, SlidersHorizontal
} from 'lucide-react'
import { courseAPI } from '../../lib/api'
import useAuthStore from '../../store/authStore'

// Demo-only sample courses. Real accounts always load from the backend.
const DEMO_COURSES = [
  {
    id: '1', title: 'Data Structures & Algorithms Masterclass', instructor: 'Dr. Sarah Chen',
    topic: 'DSA', difficulty: 'Intermediate', duration: '24h', lessonCount: 48,
    enrolledCount: 3240, progress: 65, enrolled: true,
    description: 'Complete guide to DSA with hands-on problem solving',
    color: 'from-brand-500 to-purple-600',
  },
  {
    id: '2', title: 'Full-Stack Web Development with React & Node', instructor: 'Alex Rivera',
    topic: 'Web Dev', difficulty: 'Beginner', duration: '36h', lessonCount: 72,
    enrolledCount: 5120, progress: 0, enrolled: false,
    description: 'Build modern web applications from scratch',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: '3', title: 'System Design: From Zero to Hero', instructor: 'Priya Kapoor',
    topic: 'System Design', difficulty: 'Advanced', duration: '18h', lessonCount: 36,
    enrolledCount: 2890, progress: 100, enrolled: true,
    description: 'Design scalable distributed systems like a pro',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: '4', title: 'SQL & Database Fundamentals', instructor: 'Marcus Johnson',
    topic: 'Database', difficulty: 'Beginner', duration: '12h', lessonCount: 24,
    enrolledCount: 4100, progress: 30, enrolled: true,
    description: 'Master SQL and database design principles',
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: '5', title: 'Advanced JavaScript & TypeScript', instructor: 'Elena Vasquez',
    topic: 'Web Dev', difficulty: 'Intermediate', duration: '20h', lessonCount: 40,
    enrolledCount: 6700, progress: 0, enrolled: false,
    description: 'Deep dive into modern JS patterns and TypeScript',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    id: '6', title: 'Graph Algorithms & Dynamic Programming', instructor: 'Dr. Sarah Chen',
    topic: 'DSA', difficulty: 'Advanced', duration: '15h', lessonCount: 30,
    enrolledCount: 1850, progress: 0, enrolled: false,
    description: 'Tackle the hardest coding interview problems',
    color: 'from-pink-500 to-rose-600',
  },
]

const TOPIC_ICONS = {
  DSA: Code,
  'Web Dev': Globe,
  Database: Database,
  'System Design': Cpu,
}

const DIFFICULTY_BADGE = {
  Beginner: 'badge-success',
  Intermediate: 'badge-warning',
  Advanced: 'badge-error',
}

const FILTERS = ['All', 'Enrolled', 'DSA', 'Web Dev', 'Database', 'System Design']
const SORTS = ['Popular', 'Newest', 'Progress']

// ── Course Card ───────────────────────────────────────────────────────────────
function CourseCard({ course, onEnroll, enrollingId, index }) {
  const navigate = useNavigate()
  const Icon = TOPIC_ICONS[course.topic] || BookOpen
  const isEnrolling = enrollingId === course.id

  const getButton = () => {
    if (course.progress === 100) {
      return (
        <button className="btn-sm btn-secondary w-full" onClick={() => navigate(`/courses/${course.id}`)}>
          <CheckCircle2 size={14} className="text-success" /> Completed
        </button>
      )
    }
    if (course.enrolled) {
      return (
        <button className="btn-sm btn-primary w-full" onClick={() => navigate(`/courses/${course.id}`)}>
          <Play size={14} /> Continue
        </button>
      )
    }
    return (
      <button
        className="btn-sm btn-primary w-full"
        onClick={() => onEnroll(course.id)}
        disabled={isEnrolling}
      >
        {isEnrolling ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Zap size={14} />}
        Enroll
      </button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="card-glass-hover flex flex-col cursor-pointer group"
      onClick={() => navigate(`/courses/${course.id}`)}
    >
      {/* Thumbnail */}
      <div className={`h-36 bg-gradient-to-br ${course.color} rounded-t-2xl flex items-center justify-center relative overflow-hidden`}>
        <Icon size={40} className="text-white/80 drop-shadow-lg" />
        <div className="absolute top-3 right-3">
          <span className={DIFFICULTY_BADGE[course.difficulty]}>{course.difficulty}</span>
        </div>
        {course.enrolled && course.progress < 100 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
            <div className="h-full bg-white/70 transition-all" style={{ width: `${course.progress}%` }} />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <h3 className="font-semibold text-text-primary text-sm leading-snug line-clamp-2 group-hover:text-brand-300 transition-colors">
            {course.title}
          </h3>
          <p className="text-text-tertiary text-xs mt-1">{course.instructor}</p>
        </div>

        {course.enrolled && course.progress > 0 && course.progress < 100 && (
          <div className="flex items-center gap-2">
            <div className="progress-bar h-1.5 flex-1">
              <div className="progress-fill h-full" style={{ width: `${course.progress}%` }} />
            </div>
            <span className="text-xs text-text-secondary">{course.progress}%</span>
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-text-tertiary mt-auto">
          <span className="flex items-center gap-1"><Clock size={11} /> {course.duration}</span>
          <span className="flex items-center gap-1"><BookOpen size={11} /> {course.lessonCount} lessons</span>
          <span className="flex items-center gap-1"><Users size={11} /> {course.enrolledCount.toLocaleString()}</span>
        </div>

        <div onClick={e => e.stopPropagation()}>
          {getButton()}
        </div>
      </div>
    </motion.div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="card-glass flex flex-col">
      <div className="skeleton h-36 rounded-t-2xl rounded-b-none" />
      <div className="p-4 flex flex-col gap-3">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="skeleton h-2 w-full" />
        <div className="flex gap-3">
          <div className="skeleton h-3 w-12" />
          <div className="skeleton h-3 w-14" />
          <div className="skeleton h-3 w-16" />
        </div>
        <div className="skeleton h-8 w-full" />
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CourseCatalog() {
  const { token } = useAuthStore()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [sort, setSort] = useState('Popular')
  const [enrollingId, setEnrollingId] = useState(null)

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await courseAPI.list({ search, topic: activeFilter !== 'All' && activeFilter !== 'Enrolled' ? activeFilter : undefined })
      setCourses(data?.content || data?.courses || (Array.isArray(data) ? data : []))
    } catch (err) {
      if (token?.startsWith('demo-')) {
        setCourses(DEMO_COURSES)
      } else {
        setCourses([])
        setError(err.response?.data?.message || err.message || 'Unable to load courses.')
      }
    } finally {
      setLoading(false)
    }
  }, [search, activeFilter, token])

  useEffect(() => {
    const t = setTimeout(fetchCourses, 300)
    return () => clearTimeout(t)
  }, [fetchCourses])

  const handleEnroll = async (id) => {
    setEnrollingId(id)
    try {
      await courseAPI.enroll(id)
      setCourses(prev => prev.map(c => c.id === id ? { ...c, enrolled: true } : c))
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to enroll in this course.')
    } finally {
      setEnrollingId(null)
    }
  }

  // Filter + Sort
  let filtered = courses.filter(c => {
    if (activeFilter === 'Enrolled') return c.enrolled
    if (activeFilter !== 'All') return c.topic === activeFilter
    return true
  }).filter(c =>
    !search || c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor.toLowerCase().includes(search.toLowerCase())
  )

  if (sort === 'Popular') filtered = [...filtered].sort((a, b) => b.enrolledCount - a.enrolledCount)
  else if (sort === 'Progress') filtered = [...filtered].sort((a, b) => (b.progress || 0) - (a.progress || 0))

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title">Course Catalog</h1>
        <p className="text-text-secondary text-sm mt-1">Explore curated courses to sharpen your skills</p>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            className="input-base pl-9"
            placeholder="Search courses, instructors..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search courses"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-text-tertiary" />
          <div className="flex gap-1 bg-bg-secondary border border-border-subtle rounded-xl p-1">
            {SORTS.map(s => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={sort === s ? 'tab-item-active text-xs' : 'tab-item text-xs'}
                aria-pressed={sort === s}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 flex-wrap mb-6">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
              activeFilter === f
                ? 'bg-brand-500 text-white border-brand-500 shadow-glow-brand'
                : 'bg-bg-secondary border-border-default text-text-secondary hover:border-border-strong hover:text-text-primary'
            }`}
            aria-pressed={activeFilter === f}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-error mb-3">{error}</p>
          <button className="btn-md btn-secondary" onClick={fetchCourses}>Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-24"
        >
          <BookOpen size={48} className="text-text-disabled mx-auto mb-4" />
          <h3 className="text-text-primary font-semibold text-lg">No courses found</h3>
          <p className="text-text-secondary text-sm mt-1">Try adjusting your search or filters</p>
          <button className="btn-md btn-secondary mt-4" onClick={() => { setSearch(''); setActiveFilter('All') }}>
            Clear filters
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((course, i) => (
              <CourseCard
                key={course.id}
                course={course}
                onEnroll={handleEnroll}
                enrollingId={enrollingId}
                index={i}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
