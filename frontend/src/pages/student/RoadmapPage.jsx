import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Map, RefreshCw, Sparkles, ChevronDown, ChevronRight,
  CheckCircle2, Lock, Zap, BookOpen, Code2, FileText,
  Target, Brain, TrendingUp, Clock, Calendar, ChevronLeft,
  Star, Award, AlertCircle, Loader2, RotateCcw
} from 'lucide-react'
import {
  RadialBarChart, RadialBar, ResponsiveContainer, Tooltip as RechartTooltip
} from 'recharts'
import useAuthStore from '../../store/authStore'
import { roadmapAPI } from '../../lib/api'

// ─── Mock Data ───────────────────────────────────────────────────────────────
const MOCK_ROADMAP = {
  targetRole: 'Full Stack Developer',
  generatedAt: '2024-11-18',
  milestones: [
    {
      id: 'ms1', title: 'DSA Foundations', status: 'complete',
      description: 'Core data structures and algorithms needed for any SWE role.',
      estimatedDays: 14, xpEarned: 850,
      topics: ['Arrays', 'Strings', 'HashMaps', 'Sorting'],
      prerequisites: [],
      subTasks: [
        { id: 'st1', title: 'Array & String Mastery', done: true },
        { id: 'st2', title: 'HashMap & Set Problems', done: true },
        { id: 'st3', title: 'Sorting Algorithms', done: true },
      ],
    },
    {
      id: 'ms2', title: 'OOP & Java Core', status: 'complete',
      description: 'Object-oriented design principles applied in Java.',
      estimatedDays: 10, xpEarned: 620,
      topics: ['OOP', 'Java', 'Collections', 'Generics'],
      prerequisites: ['DSA Foundations'],
      subTasks: [
        { id: 'st4', title: 'OOP Principles', done: true },
        { id: 'st5', title: 'Java Collections', done: true },
      ],
    },
    {
      id: 'ms3', title: 'Advanced DSA', status: 'active',
      description: 'Trees, Graphs, DP — the advanced patterns that appear in FAANG interviews.',
      estimatedDays: 21,
      topics: ['Binary Trees', 'Graphs', 'Dynamic Programming', 'Backtracking'],
      prerequisites: ['DSA Foundations', 'OOP & Java Core'],
      subTasks: [
        { id: 'st6', title: 'Binary Trees (40%)', done: false },
        { id: 'st7', title: 'Graph BFS/DFS', done: false },
        { id: 'st8', title: 'Dynamic Programming Intro', done: false },
      ],
    },
    {
      id: 'ms4', title: 'System Design Intro', status: 'locked',
      description: 'High-level system design fundamentals for backend roles.',
      estimatedDays: 14,
      topics: ['Databases', 'Caching', 'Load Balancing', 'APIs'],
      prerequisites: ['Advanced DSA'],
      subTasks: [
        { id: 'st9', title: 'Database Design', done: false },
        { id: 'st10', title: 'REST & GraphQL APIs', done: false },
      ],
    },
    {
      id: 'ms5', title: 'Mock Interview Prep', status: 'locked',
      description: 'Simulate real FAANG-style interviews and refine communication.',
      estimatedDays: 10,
      topics: ['Behavioral', 'System Design', 'Coding Interviews'],
      prerequisites: ['System Design Intro', 'Advanced DSA'],
      subTasks: [
        { id: 'st11', title: '5 Mock Interviews', done: false },
        { id: 'st12', title: 'STAR method practice', done: false },
      ],
    },
  ],
}

const TASK_TYPES = {
  theory:   { icon: BookOpen, label: 'Theory',   color: 'text-brand-400',   bg: 'bg-brand-500/10' },
  problem:  { icon: Code2,    label: 'Problem',  color: 'text-ai-400',      bg: 'bg-ai-500/10' },
  quiz:     { icon: FileText, label: 'Quiz',     color: 'text-warning',     bg: 'bg-warning/10' },
  project:  { icon: Target,   label: 'Project',  color: 'text-success',     bg: 'bg-success/10' },
}

const MOCK_WEEKLY_TASKS = (() => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
  return days.map((day, i) => ({
    day,
    isToday: i === todayIdx,
    tasks: [
      { id: `${day}-1`, type: 'theory',  title: 'Read: Binary Trees Ch.2',    time: '20 min', done: i < todayIdx, rescheduled: false },
      { id: `${day}-2`, type: 'problem', title: 'Solve 2 Tree Problems',       time: '40 min', done: i < todayIdx, rescheduled: i === 1 },
      ...(i % 2 === 0 ? [{ id: `${day}-3`, type: 'quiz', title: 'Trees Quiz', time: '15 min', done: i < todayIdx, rescheduled: false }] : []),
    ],
  }))
})()

const MOCK_COMPLETED = [
  { id: 'c1', topic: 'Arrays & Strings',    xp: 320, date: 'Nov 10' },
  { id: 'c2', topic: 'HashMaps & Sets',     xp: 280, date: 'Nov 12' },
  { id: 'c3', topic: 'Sorting Algorithms',  xp: 250, date: 'Nov 14' },
  { id: 'c4', topic: 'OOP Principles',      xp: 310, date: 'Nov 16' },
  { id: 'c5', topic: 'Java Collections',    xp: 310, date: 'Nov 18' },
]

const MOCK_AI_INSIGHTS = {
  strongest: 'Arrays',
  focusArea: 'Dynamic Programming',
  recommended: 'Binary Search',
  readiness: 68,
}

// ─── Animation helpers ────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: [0.16,1,0.3,1] } }),
}
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const tabContent = {
  hidden: { opacity: 0, x: 12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16,1,0.3,1] } },
  exit: { opacity: 0, x: -12, transition: { duration: 0.15 } },
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function MilestoneCard({ ms, expanded, onToggle }) {
  const statusConfig = {
    complete: { ring: 'border-success/40 shadow-[0_0_12px_rgba(34,197,94,0.1)]', dot: 'bg-success', label: 'badge-success', text: 'Complete' },
    active:   { ring: 'border-brand-500/50 shadow-glow-brand', dot: 'bg-brand-500', label: 'badge-brand', text: 'Active' },
    locked:   { ring: 'border-border-subtle', dot: 'bg-bg-tertiary border border-border-default', label: 'badge-ghost', text: 'Locked' },
  }
  const cfg = statusConfig[ms.status]

  return (
    <div className={`card-glass border ${cfg.ring} transition-all duration-300`}>
      <button
        className="w-full flex items-start gap-4 p-5 text-left focus-visible:outline-none"
        onClick={onToggle}
        aria-expanded={expanded}>
        {/* Status dot */}
        <div className={`flex-shrink-0 w-5 h-5 rounded-full mt-0.5 ${cfg.dot}`} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h4 className={`font-semibold text-sm ${ms.status === 'locked' ? 'text-text-tertiary' : 'text-text-primary'}`}>
              {ms.title}
            </h4>
            <span className={`badge ${cfg.label}`}>{cfg.text}</span>
            {ms.status === 'locked' && <Lock size={12} className="text-text-disabled" />}
          </div>
          <p className="text-xs text-text-secondary">{ms.description}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-text-tertiary">
            <span className="flex items-center gap-1"><Clock size={11} /> ~{ms.estimatedDays} days</span>
            <span className="flex items-center gap-1"><Code2 size={11} /> {ms.topics.length} topics</span>
          </div>
        </div>
        <ChevronDown size={16} className={`flex-shrink-0 text-text-tertiary transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16,1,0.3,1] }}>
            <div className="px-5 pb-5 border-t border-border-subtle pt-4 space-y-4">
              {/* Topics */}
              <div>
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Topics Covered</p>
                <div className="flex flex-wrap gap-1.5">
                  {ms.topics.map(t => <span key={t} className="badge badge-ghost">{t}</span>)}
                </div>
              </div>
              {/* Prerequisites */}
              {ms.prerequisites.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Prerequisites</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ms.prerequisites.map(p => (
                      <span key={p} className="badge badge-brand flex items-center gap-1">
                        <ChevronRight size={10} />{p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* Sub-tasks */}
              <div>
                <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">Sub-tasks</p>
                <div className="space-y-1.5">
                  {ms.subTasks.map(st => (
                    <div key={st.id} className="flex items-center gap-2 text-sm">
                      {st.done
                        ? <CheckCircle2 size={14} className="text-success flex-shrink-0" />
                        : <div className="w-3.5 h-3.5 rounded-full border-2 border-border-default flex-shrink-0" />}
                      <span className={st.done ? 'text-text-secondary line-through' : 'text-text-primary'}>{st.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// SVG Progress Ring
function ProgressRing({ pct, size = 60, strokeWidth = 6, color = '#6248FF' }) {
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.16,1,0.3,1)' }} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
        className="rotate-90" fill="white" fontSize="11" fontWeight="600"
        style={{ transform: 'rotate(90deg)', transformOrigin: '50% 50%', transformBox: 'fill-box' }}>
        {pct}%
      </text>
    </svg>
  )
}

function AISidebar({ insights, onRegenerate, loading }) {
  return (
    <div className="card-glass p-5 space-y-4 sticky top-6">
      <div className="flex items-center gap-2 mb-2">
        <span className="dot-ai" />
        <h3 className="text-sm font-semibold text-text-primary">AI Insights</h3>
        <span className="ai-tag text-xs ml-auto">Live</span>
      </div>

      <div className="space-y-3">
        <div className="p-3 rounded-xl bg-success/5 border border-success/15">
          <p className="text-xs text-text-secondary mb-0.5 uppercase tracking-wide">Strongest</p>
          <div className="flex items-center gap-1.5">
            <Star size={13} className="text-success" />
            <span className="text-sm font-semibold text-text-primary">{insights.strongest}</span>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-warning/5 border border-warning/15">
          <p className="text-xs text-text-secondary mb-0.5 uppercase tracking-wide">Focus Area</p>
          <div className="flex items-center gap-1.5">
            <Target size={13} className="text-warning" />
            <span className="text-sm font-semibold text-text-primary">{insights.focusArea}</span>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-brand-500/5 border border-brand-500/15">
          <p className="text-xs text-text-secondary mb-0.5 uppercase tracking-wide">Recommended Next</p>
          <div className="flex items-center gap-1.5">
            <TrendingUp size={13} className="text-brand-400" />
            <span className="text-sm font-semibold text-text-primary">{insights.recommended}</span>
          </div>
        </div>
      </div>

      <div className="divider my-0" />

      <div>
        <p className="text-xs text-text-secondary mb-2">Placement Readiness</p>
        <div className="flex items-center gap-3">
          <ProgressRing pct={insights.readiness} size={48} strokeWidth={5} color="#6248FF" />
          <div>
            <span className="text-lg font-bold text-text-primary">{insights.readiness}%</span>
            <p className="text-xs text-text-secondary">Interview Ready</p>
          </div>
        </div>
      </div>

      <button onClick={onRegenerate} disabled={loading}
        className="btn-ai btn-sm w-full flex items-center justify-center gap-2">
        {loading ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
        Re-generate Roadmap
      </button>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
const TABS = ['Overview', 'Daily Tasks', 'Milestones', 'Completed']

export default function RoadmapPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [roadmap, setRoadmap]           = useState(null)
  const [loading, setLoading]           = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError]               = useState(null)
  const [activeTab, setActiveTab]       = useState('Overview')
  const [expanded, setExpanded]         = useState({})
  const [weekOffset, setWeekOffset]     = useState(0)
  const tabRefs = useRef({})

  // ── Keyboard navigation for tabs ──
  const handleTabKey = (e, tab) => {
    const idx = TABS.indexOf(tab)
    if (e.key === 'ArrowRight') { const next = TABS[Math.min(idx + 1, TABS.length - 1)]; setActiveTab(next); tabRefs.current[next]?.focus() }
    if (e.key === 'ArrowLeft')  { const prev = TABS[Math.max(idx - 1, 0)]; setActiveTab(prev); tabRefs.current[prev]?.focus() }
  }

  // ── Fetch roadmap ──
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await roadmapAPI.get()
        setRoadmap(data)
      } catch {
        setRoadmap(MOCK_ROADMAP) // fall back to mock
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleRegenerate = async () => {
    setRegenerating(true)
    try {
      const { data } = await roadmapAPI.generate({ userId: user?.id })
      setRoadmap(data)
    } catch {
      // keep existing
    } finally {
      setRegenerating(false)
    }
  }

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  // ── Loading state ──
  if (loading) {
    return (
      <div className="page-container py-16 flex flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="text-brand-500 animate-spin" />
        <p className="text-text-secondary">Loading your roadmap…</p>
      </div>
    )
  }

  // ── Empty state ──
  if (!roadmap) {
    return (
      <div className="page-container py-16 flex flex-col items-center justify-center gap-6 text-center">
        <div className="w-20 h-20 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
          <Map size={36} className="text-brand-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">No Roadmap Yet</h2>
          <p className="text-text-secondary max-w-sm">Complete the onboarding to get your personalized AI-generated learning roadmap.</p>
        </div>
        <button onClick={() => navigate('/onboarding')} className="btn-primary btn-md flex items-center gap-2">
          <Sparkles size={16} /> Generate Your Roadmap
        </button>
      </div>
    )
  }

  const data = roadmap || MOCK_ROADMAP

  return (
    <div className="page-container py-6">
      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="section-title">Your Roadmap</h1>
            <span className="badge badge-brand flex items-center gap-1.5">
              <Target size={10} /> {data.targetRole}
            </span>
          </div>
          <p className="section-sub">Generated on {data.generatedAt} · AI-personalized for you</p>
        </div>
        <button onClick={handleRegenerate} disabled={regenerating}
          className="btn-secondary btn-md flex items-center gap-2 self-start sm:self-auto">
          {regenerating ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
          Regenerate
        </button>
      </motion.div>

      {/* ── Layout: main + sidebar ── */}
      <div className="flex gap-6 items-start">
        {/* ── Main content ── */}
        <div className="flex-1 min-w-0">
          {/* ── Tabs ── */}
          <div role="tablist" aria-label="Roadmap sections"
            className="flex gap-1 p-1 bg-bg-secondary border border-border-subtle rounded-xl mb-6 overflow-x-auto no-scrollbar">
            {TABS.map(tab => (
              <button key={tab} role="tab" id={`tab-${tab}`}
                ref={el => tabRefs.current[tab] = el}
                aria-selected={activeTab === tab}
                aria-controls={`panel-${tab}`}
                tabIndex={activeTab === tab ? 0 : -1}
                className={activeTab === tab ? 'tab-item-active' : 'tab-item'}
                onClick={() => setActiveTab(tab)}
                onKeyDown={e => handleTabKey(e, tab)}>
                {tab}
              </button>
            ))}
          </div>

          {/* ── Tab panels ── */}
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial="hidden" animate="show" exit="exit" variants={tabContent}
              role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>

              {/* ── OVERVIEW TAB ── */}
              {activeTab === 'Overview' && (
                <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
                  {data.milestones.map((ms, i) => (
                    <motion.div key={ms.id} custom={i} variants={fadeUp}>
                      <MilestoneCard ms={ms} expanded={!!expanded[ms.id]} onToggle={() => toggleExpand(ms.id)} />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* ── DAILY TASKS TAB ── */}
              {activeTab === 'Daily Tasks' && (
                <div>
                  {/* Week nav */}
                  <div className="flex items-center justify-between mb-4">
                    <button className="btn-ghost btn-sm flex items-center gap-1"
                      onClick={() => setWeekOffset(w => w - 1)}>
                      <ChevronLeft size={16} /> Prev
                    </button>
                    <span className="text-sm font-medium text-text-secondary">
                      {weekOffset === 0 ? 'This Week' : weekOffset < 0 ? `${Math.abs(weekOffset)} week(s) ago` : `${weekOffset} week(s) ahead`}
                    </span>
                    <button className="btn-ghost btn-sm flex items-center gap-1"
                      onClick={() => setWeekOffset(w => w + 1)}>
                      Next <ChevronRight size={16} />
                    </button>
                  </div>

                  <motion.div variants={stagger} initial="hidden" animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
                    {MOCK_WEEKLY_TASKS.map((col, i) => (
                      <motion.div key={col.day} custom={i} variants={fadeUp}
                        className={`card-glass p-3 ${col.isToday ? 'border-brand-500/40 shadow-glow-brand' : ''}`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-xs font-semibold uppercase ${col.isToday ? 'text-brand-300' : 'text-text-secondary'}`}>
                            {col.day}
                          </span>
                          {col.isToday && <span className="dot-ai" />}
                        </div>
                        <div className="space-y-2">
                          {col.tasks.map(task => {
                            const tCfg = TASK_TYPES[task.type]
                            return (
                              <div key={task.id} className={`group relative p-2 rounded-lg border transition-all duration-150
                                ${task.done ? 'opacity-50 bg-success/5 border-success/15' : `${tCfg.bg} border-transparent hover:border-border-default`}`}>
                                <div className="flex items-start gap-1.5">
                                  <tCfg.icon size={12} className={`${tCfg.color} flex-shrink-0 mt-0.5`} />
                                  <p className={`text-xs leading-snug flex-1 ${task.done ? 'line-through text-text-tertiary' : 'text-text-primary'}`}>
                                    {task.title}
                                  </p>
                                </div>
                                <p className="text-2xs text-text-tertiary mt-1 ml-4">{task.time}</p>
                                {task.rescheduled && (
                                  <div className="mt-1 ml-4 group-hover:block">
                                    <span className="text-2xs text-ai-400 italic">AI adjusted this task</span>
                                  </div>
                                )}
                                {!task.done && col.isToday && (
                                  <button className="mt-2 w-full text-2xs btn-secondary py-0.5 px-1 rounded flex items-center justify-center gap-0.5">
                                    <CheckCircle2 size={10} /> Done
                                  </button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              )}

              {/* ── MILESTONES TAB ── */}
              {activeTab === 'Milestones' && (
                <motion.div variants={stagger} initial="hidden" animate="show"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.milestones.map((ms, i) => {
                    const statusColors = {
                      complete: { color: '#22C55E', pct: 100 },
                      active:   { color: '#6248FF', pct: 42 },
                      locked:   { color: '#1E2630', pct: 0 },
                    }
                    const cfg = statusColors[ms.status]
                    return (
                      <motion.div key={ms.id} custom={i} variants={fadeUp}
                        className="card-glass-hover p-5 flex items-start gap-4">
                        <ProgressRing pct={cfg.pct} size={56} strokeWidth={5} color={cfg.color} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="text-sm font-semibold text-text-primary truncate">{ms.title}</h4>
                            <span className={`badge ${ms.status === 'complete' ? 'badge-success' : ms.status === 'active' ? 'badge-brand' : 'badge-ghost'}`}>
                              {ms.status === 'complete' ? 'Done' : ms.status === 'active' ? 'Active' : 'Locked'}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary mb-2 line-clamp-2">{ms.description}</p>
                          <div className="flex flex-wrap gap-1">
                            {ms.topics.slice(0,3).map(t => <span key={t} className="badge badge-ghost">{t}</span>)}
                            {ms.topics.length > 3 && <span className="badge badge-ghost">+{ms.topics.length - 3}</span>}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}

              {/* ── COMPLETED TAB ── */}
              {activeTab === 'Completed' && (
                <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
                  {MOCK_COMPLETED.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <Award size={40} className="text-text-disabled" />
                      <p className="text-text-secondary">No completed topics yet. Keep going!</p>
                    </div>
                  ) : MOCK_COMPLETED.map((item, i) => (
                    <motion.div key={item.id} custom={i} variants={fadeUp}
                      className="card-glass p-4 flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 size={18} className="text-success" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text-primary text-sm">{item.topic}</p>
                        <p className="text-xs text-text-tertiary mt-0.5">Completed {item.date}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Zap size={13} className="text-warning" />
                        <span className="text-sm font-bold text-warning">+{item.xp} XP</span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Sidebar (desktop only) ── */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <AISidebar insights={MOCK_AI_INSIGHTS} onRegenerate={handleRegenerate} loading={regenerating} />
        </div>
      </div>
    </div>
  )
}
