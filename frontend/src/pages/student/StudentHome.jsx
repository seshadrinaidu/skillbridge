import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Flame, Zap, Target, CheckCircle2, Circle, Clock, BookOpen,
  Code2, Brain, ChevronRight, TrendingUp, Award, Calendar,
  BarChart2, Sparkles, ArrowRight, Play, Trophy, Activity,
  CheckCheck, AlertCircle, Lock
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { roadmapAPI, userAPI, performanceAPI } from '../../lib/api'

// ─── Mock data ───────────────────────────────────────────────────────────────
const MOCK_DAILY_PROBLEM = {
  id: 'prob-42',
  title: 'Binary Tree Level Order Traversal',
  difficulty: 'Medium',
  topics: ['Binary Trees', 'BFS', 'Queue'],
  xp: 120,
  timeEstimate: '25 min',
  aiRationale: 'Selected because you scored 42% on Binary Trees last session',
  number: 102,
}

const MOCK_TASKS = [
  { id: 't1', icon: Code2,  label: 'Solve 2 DSA Problems',       duration: '45 min', status: 'done' },
  { id: 't2', icon: BookOpen,label: 'Read: HashMap Internals',    duration: '20 min', status: 'in-progress' },
  { id: 't3', icon: Brain,   label: 'Binary Trees Quiz',          duration: '15 min', status: 'pending' },
  { id: 't4', icon: Code2,   label: 'Complete SQL Module Ch. 3',  duration: '30 min', status: 'pending' },
  { id: 't5', icon: Target,  label: 'Mock Interview Practice',    duration: '45 min', status: 'pending' },
]

const MOCK_SKILLS = [
  { name: 'Arrays',           pct: 78, color: '#6248FF' },
  { name: 'OOP',              pct: 65, color: '#00D4D4' },
  { name: 'SQL',              pct: 42, color: '#6248FF' },
  { name: 'Binary Trees',     pct: 38, color: '#F59E0B' },
  { name: 'Dynamic Programming', pct: 24, color: '#EF4444' },
  { name: 'System Design',    pct: 51, color: '#00D4D4' },
  { name: 'Graphs',           pct: 29, color: '#EF4444' },
  { name: 'Sorting',          pct: 83, color: '#22C55E' },
]

const MOCK_NEXT_STEPS = [
  { id: 'ns1', title: 'Complete 2 more DSA problems', desc: 'You need 2 problems to unlock Milestone 3', icon: Code2, cta: 'Practice Now', href: '/practice' },
  { id: 'ns2', title: 'Do mock interview', desc: 'Your interview readiness is 68% — boost it!', icon: Brain, cta: 'Start Interview', href: '/interview' },
  { id: 'ns3', title: 'Finish SQL Module', desc: 'Chapter 3 is in progress — 60% complete', icon: BookOpen, cta: 'Continue', href: '/courses' },
]

const MOCK_MILESTONES = [
  { id: 'm1', title: 'DSA Foundations',    status: 'complete', date: 'Nov 10' },
  { id: 'm2', title: 'OOP & Java Core',    status: 'complete', date: 'Nov 15' },
  { id: 'm3', title: 'Advanced DSA',       status: 'active',   date: 'Nov 28 (est.)' },
  { id: 'm4', title: 'System Design Intro',status: 'locked',   date: 'Dec 10 (est.)' },
  { id: 'm5', title: 'Mock Interview Prep',status: 'locked',   date: 'Dec 20 (est.)' },
]

const MOCK_ACTIVITY = [
  { id: 'a1', text: 'Solved "Two Sum" (Easy)', time: '2h ago',   icon: Code2,   color: 'text-ai-400' },
  { id: 'a2', text: 'Completed OOP Lesson 5',  time: '5h ago',   icon: CheckCheck, color: 'text-success' },
  { id: 'a3', text: 'Earned 150 XP on quiz',   time: 'Yesterday',icon: Trophy,  color: 'text-warning' },
  { id: 'a4', text: 'Started HashMap Module',  time: 'Yesterday',icon: BookOpen,color: 'text-brand-400' },
  { id: 'a5', text: 'Mock interview (68%)',     time: '2 days ago',icon: Brain,  color: 'text-text-secondary' },
]

const MOCK_STATS = {
  streak: 7,
  problemsSolved: 48,
  accuracy: 73,
  timeToday: 94, // minutes
}

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: [0.16,1,0.3,1] } }),
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const difficultyBadge = (d) => {
  const map = { Easy: 'badge-success', Medium: 'badge-warning', Hard: 'badge-error' }
  return map[d] || 'badge-ghost'
}

const statusIcon = (s) => {
  if (s === 'done') return <CheckCircle2 size={16} className="text-success" />
  if (s === 'in-progress') return <Activity size={16} className="text-ai-400" />
  return <Circle size={16} className="text-text-tertiary" />
}

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function QuickStats({ stats }) {
  const items = [
    { label: 'Streak',         value: `${stats.streak}d`,         icon: Flame,   color: 'text-orange-400' },
    { label: 'Solved',         value: stats.problemsSolved,        icon: Code2,   color: 'text-brand-400' },
    { label: 'Accuracy',       value: `${stats.accuracy}%`,        icon: Target,  color: 'text-ai-400' },
    { label: 'Time Today',     value: `${stats.timeToday}m`,       icon: Clock,   color: 'text-success' },
  ]
  return (
    <motion.div variants={stagger} initial="hidden" animate="show"
      className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((item, i) => (
        <motion.div key={item.label} custom={i} variants={fadeUp}
          className="card-glass p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-text-secondary text-xs font-medium uppercase tracking-wide">
            <item.icon size={14} className={item.color} />
            {item.label}
          </div>
          <span className="text-2xl font-bold text-text-primary">{item.value}</span>
        </motion.div>
      ))}
    </motion.div>
  )
}

function DailyProblemCard({ problem, navigate }) {
  return (
    <motion.div variants={fadeUp} custom={0}
      className="relative card-glass p-6 border-brand-500/30 shadow-glow-brand overflow-hidden">
      {/* Glow bg */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-ai-500/5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="ai-tag flex items-center gap-1.5">
            <Sparkles size={12} />
            Today's Daily Problem
          </span>
          <span className={`badge ${difficultyBadge(problem.difficulty)}`}>{problem.difficulty}</span>
        </div>

        <h2 className="text-xl font-bold text-text-primary mb-2">
          #{problem.number} — {problem.title}
        </h2>

        {/* Topic tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {problem.topics.map(t => (
            <span key={t} className="badge badge-ghost">{t}</span>
          ))}
        </div>

        {/* AI rationale */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-ai-500/5 border border-ai-500/15 mb-5">
          <Brain size={14} className="text-ai-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-text-secondary">{problem.aiRationale}</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            <span className="flex items-center gap-1.5"><Clock size={14} />{problem.timeEstimate}</span>
            <span className="flex items-center gap-1.5 text-warning"><Zap size={14} />+{problem.xp} XP</span>
          </div>
          <button
            className="btn-primary btn-md flex items-center gap-2"
            onClick={() => navigate(`/practice/${problem.id}`)}>
            <Play size={15} />
            Solve Now
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function TodayPlan({ tasks, onToggle }) {
  return (
    <motion.div variants={fadeUp} custom={1} className="card-glass p-5">
      <h3 className="section-title text-lg mb-4 flex items-center gap-2">
        <Calendar size={18} className="text-brand-400" /> Today's Plan
      </h3>
      <div className="space-y-2">
        {tasks.map((task) => (
          <motion.button key={task.id} layout
            onClick={() => onToggle(task.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left
              ${task.status === 'done'
                ? 'bg-success/5 border-success/15 opacity-70'
                : task.status === 'in-progress'
                  ? 'bg-ai-500/5 border-ai-500/15'
                  : 'bg-bg-tertiary border-border-subtle hover:border-border-default'}`}>
            {statusIcon(task.status)}
            <task.icon size={15} className="text-text-secondary flex-shrink-0" />
            <span className={`flex-1 text-sm font-medium ${task.status === 'done' ? 'line-through text-text-tertiary' : 'text-text-primary'}`}>
              {task.label}
            </span>
            <span className="flex items-center gap-1 text-xs text-text-tertiary flex-shrink-0">
              <Clock size={12} />{task.duration}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

function SkillProgress({ skills }) {
  return (
    <motion.div variants={fadeUp} custom={2} className="card-glass p-5">
      <h3 className="section-title text-lg mb-4 flex items-center gap-2">
        <BarChart2 size={18} className="text-ai-400" /> Skill Progress
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
        {skills.map((skill) => (
          <div key={skill.name} className="flex-shrink-0 w-36 card-glass-hover p-3 cursor-default">
            <p className="text-xs font-medium text-text-secondary mb-2 truncate">{skill.name}</p>
            <div className="flex items-end justify-between mb-2">
              <span className="text-lg font-bold text-text-primary">{skill.pct}%</span>
            </div>
            <div className="progress-bar h-1.5 w-full">
              <div className="progress-fill h-full" style={{ width: `${skill.pct}%`, background: skill.color }} />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function PlacementNextSteps({ steps, navigate }) {
  return (
    <motion.div variants={fadeUp} custom={3}>
      <h3 className="section-title text-lg mb-3 flex items-center gap-2">
        <Target size={18} className="text-brand-400" /> Placement Next Steps
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {steps.map((step, i) => (
          <motion.div key={step.id} custom={i} variants={fadeUp}
            className="card-glass-hover p-4 flex flex-col gap-3">
            <step.icon size={20} className="text-brand-400" />
            <div>
              <p className="font-semibold text-text-primary text-sm">{step.title}</p>
              <p className="text-xs text-text-secondary mt-0.5">{step.desc}</p>
            </div>
            <button onClick={() => navigate(step.href)}
              className="btn-secondary btn-sm mt-auto flex items-center gap-1.5">
              {step.cta} <ArrowRight size={13} />
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function MilestoneTimeline({ milestones }) {
  return (
    <motion.div variants={fadeUp} custom={4} className="card-glass p-5">
      <h3 className="section-title text-lg mb-4 flex items-center gap-2">
        <Trophy size={18} className="text-warning" /> Project Milestones
      </h3>
      <div className="relative pl-5">
        {/* Vertical line */}
        <div className="absolute left-2 top-0 bottom-0 w-px bg-border-subtle" />
        <div className="space-y-4">
          {milestones.map((m) => (
            <div key={m.id} className="flex items-start gap-3">
              {/* Dot */}
              <div className={`flex-shrink-0 w-4 h-4 rounded-full border-2 mt-0.5 -ml-5 relative z-10
                ${m.status === 'complete' ? 'bg-success border-success' :
                  m.status === 'active' ? 'bg-brand-500 border-brand-500 shadow-glow-brand' :
                  'bg-bg-tertiary border-border-default'}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-semibold ${
                    m.status === 'active' ? 'text-brand-300' :
                    m.status === 'complete' ? 'text-text-secondary line-through' :
                    'text-text-tertiary'}`}>
                    {m.title}
                  </span>
                  {m.status === 'active' && <span className="badge badge-brand">Active</span>}
                  {m.status === 'locked' && <Lock size={12} className="text-text-disabled" />}
                </div>
                <p className="text-xs text-text-tertiary mt-0.5">{m.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function RecentActivity({ activity }) {
  return (
    <motion.div variants={fadeUp} custom={5} className="card-glass p-5">
      <h3 className="section-title text-lg mb-4 flex items-center gap-2">
        <Activity size={18} className="text-ai-400" /> Recent Activity
      </h3>
      <div className="space-y-3">
        {activity.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-bg-tertiary flex items-center justify-center flex-shrink-0">
              <item.icon size={15} className={item.color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary truncate">{item.text}</p>
            </div>
            <span className="text-xs text-text-tertiary flex-shrink-0">{item.time}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StudentHome() {
  const navigate = useNavigate()
  const { user, token } = useAuthStore()

  const [dailyProblem, setDailyProblem]  = useState(MOCK_DAILY_PROBLEM)
  const [tasks, setTasks]                = useState(MOCK_TASKS)
  const [skills]                         = useState(MOCK_SKILLS)
  const [stats, setStats]                = useState(MOCK_STATS)
  const [loading, setLoading]            = useState(true)
  const [error, setError]                = useState(null)

  const firstName = user?.name?.split(' ')[0] || 'Student'
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  // ── Data fetch ──
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [dpRes, statsRes] = await Promise.all([
          roadmapAPI.getDailyProblem(),
          userAPI.getStats(),
        ])
        if (dpRes?.data)    setDailyProblem(dpRes.data)
        if (statsRes?.data) setStats(statsRes.data)
      } catch (err) {
        if (token?.startsWith('demo-')) return
        setError(err.response?.data?.message || err.message || 'Unable to load your dashboard.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t =>
      t.id === id
        ? { ...t, status: t.status === 'done' ? 'pending' : 'done' }
        : t
    ))
  }

  const doneCount = tasks.filter(t => t.status === 'done').length
  const planPct = Math.round((doneCount / tasks.length) * 100)

  if (error) {
    return (
      <div className="page-container py-16 flex flex-col items-center justify-center gap-4">
        <AlertCircle size={48} className="text-error" />
        <p className="text-text-secondary">{error}</p>
        <button className="btn-primary btn-md" onClick={() => window.location.reload()}>Retry</button>
      </div>
    )
  }

  return (
    <div className="page-container py-6 space-y-6">
      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-text-secondary text-sm mt-0.5">{today}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Daily plan progress */}
          <div className="flex items-center gap-2 card-glass px-3 py-2 rounded-xl">
            <div className="progress-bar h-1.5 w-24">
              <div className="progress-fill h-full" style={{ width: `${planPct}%` }} />
            </div>
            <span className="text-xs text-text-secondary">{doneCount}/{tasks.length} done</span>
          </div>
          {/* Streak badge */}
          <div className="flex items-center gap-1.5 card-glass px-3 py-2 rounded-xl border-orange-500/20">
            <Flame size={16} className="text-orange-400" />
            <span className="text-sm font-bold text-text-primary">{stats.streak}</span>
            <span className="text-xs text-text-secondary">day streak</span>
          </div>
        </div>
      </motion.div>

      {/* ── Quick stats ── */}
      <QuickStats stats={stats} />

      {/* ── Daily Problem (Primary CTA) ── */}
      <motion.div initial="hidden" animate="show" variants={stagger}>
        <DailyProblemCard problem={dailyProblem} navigate={navigate} />
      </motion.div>

      {/* ── 2-col grid on desktop ── */}
      <motion.div initial="hidden" animate="show" variants={stagger}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodayPlan tasks={tasks} onToggle={toggleTask} />
        <MilestoneTimeline milestones={MOCK_MILESTONES} />
      </motion.div>

      {/* ── Skill progress (horizontal scroll) ── */}
      <motion.div initial="hidden" animate="show" variants={stagger}>
        <SkillProgress skills={skills} />
      </motion.div>

      {/* ── Placement next steps ── */}
      <motion.div initial="hidden" animate="show" variants={stagger}>
        <PlacementNextSteps steps={MOCK_NEXT_STEPS} navigate={navigate} />
      </motion.div>

      {/* ── Recent activity ── */}
      <motion.div initial="hidden" animate="show" variants={stagger}>
        <RecentActivity activity={MOCK_ACTIVITY} />
      </motion.div>
    </div>
  )
}
