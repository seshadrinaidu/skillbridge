import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Brain, Target, Flame, Clock, ChevronRight, ChevronLeft,
  Plus, X, Lightbulb, Send, Flag, SkipForward, BarChart3,
  CheckCircle, AlertCircle, RefreshCw, Share2, ArrowLeft,
  Code2, MessageSquare, Zap, Trophy, Eye, EyeOff
} from 'lucide-react'
import { interviewAPI } from '../../lib/api'

// ── Fade/slide variants ──────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] } }),
}

// ── Mock data ────────────────────────────────────────────────────────────────
const MOCK_SESSIONS = [
  { id: '1', date: '2024-01-15', role: 'Frontend Developer', mode: 'Guided', score: 78, questions: 10 },
  { id: '2', date: '2024-01-12', role: 'Backend Developer', mode: 'Simulation', score: 65, questions: 10 },
  { id: '3', date: '2024-01-08', role: 'Full Stack Developer', mode: 'Guided', score: 82, questions: 5 },
]

const TOPIC_CHIPS = ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'OOP', 'SQL', 'System Design', 'OS', 'DBMS', 'CN', 'DP', 'Recursion']

const MOCK_QUESTIONS = [
  { id: 1, topic: 'Arrays', difficulty: 'Medium', type: 'coding', text: 'Implement a function to find the maximum subarray sum (Kadane\'s Algorithm). Return the sum value.', hint: 'Think about maintaining a running sum and resetting it when it goes negative. Keep track of the maximum seen so far.' },
  { id: 2, topic: 'OOP', difficulty: 'Easy', type: 'theory', text: 'Explain the four pillars of Object-Oriented Programming with real-world examples for each.', hint: 'The four pillars are Encapsulation, Abstraction, Inheritance, and Polymorphism. Think of real objects around you.' },
  { id: 3, topic: 'Linked Lists', difficulty: 'Medium', type: 'coding', text: 'Implement a function to detect a cycle in a linked list. Return true if a cycle exists, false otherwise.', hint: 'Use Floyd\'s Cycle Detection algorithm — the "tortoise and hare" approach with slow and fast pointers.' },
  { id: 4, topic: 'SQL', difficulty: 'Easy', type: 'theory', text: 'What is the difference between INNER JOIN, LEFT JOIN, and RIGHT JOIN? Provide examples for each.', hint: 'Think about which rows are included from each table when no match is found.' },
  { id: 5, topic: 'System Design', difficulty: 'Hard', type: 'theory', text: 'Design a URL shortening service like bit.ly. Discuss the components, database schema, and scalability concerns.', hint: 'Consider: hash function for shortening, database choice, caching strategy, and load balancing.' },
]

// ── Score ring SVG ──────────────────────────────────────────────────────────
function ScoreRing({ score, size = 120, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease' }} />
    </svg>
  )
}

// ── Difficulty badge ─────────────────────────────────────────────────────────
function DiffBadge({ diff }) {
  const cls = diff === 'Easy' ? 'badge-success' : diff === 'Medium' ? 'badge-warning' : 'badge-error'
  return <span className={cls}>{diff}</span>
}

// ── Setup Modal ──────────────────────────────────────────────────────────────
function SetupModal({ onClose, onStart }) {
  const [config, setConfig] = useState({
    role: 'Frontend', experience: 'Junior', topics: ['Arrays', 'OOP'],
    numQuestions: 10, mode: 'Guided',
  })
  const roles = ['Frontend', 'Backend', 'Full Stack', 'Data Science', 'DevOps']
  const levels = ['Junior', 'Mid', 'Senior']
  const counts = [5, 10, 15]

  const toggleTopic = (t) => setConfig(c => ({
    ...c, topics: c.topics.includes(t) ? c.topics.filter(x => x !== t) : [...c.topics, t]
  }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(8,11,18,0.85)', backdropFilter: 'blur(8px)' }}>
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
        className="card-glass w-full max-w-lg p-6 relative overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 btn-ghost btn-sm"><X size={18} /></button>
        <h2 className="text-xl font-bold mb-1">Setup Interview Session</h2>
        <p className="text-text-secondary text-sm mb-6">Configure your mock interview parameters</p>

        {/* Role */}
        <div className="mb-4">
          <label className="label">Role / Position</label>
          <div className="flex flex-wrap gap-2">
            {roles.map(r => (
              <button key={r} onClick={() => setConfig(c => ({ ...c, role: r }))}
                className={`btn-sm ${config.role === r ? 'btn-primary' : 'btn-secondary'}`}>{r}</button>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div className="mb-4">
          <label className="label">Experience Level</label>
          <div className="flex gap-2">
            {levels.map(l => (
              <button key={l} onClick={() => setConfig(c => ({ ...c, experience: l }))}
                className={`btn-sm ${config.experience === l ? 'btn-primary' : 'btn-secondary'}`}>{l}</button>
            ))}
          </div>
        </div>

        {/* Topics */}
        <div className="mb-4">
          <label className="label">Topics to Focus</label>
          <div className="flex flex-wrap gap-2">
            {TOPIC_CHIPS.map(t => (
              <button key={t} onClick={() => toggleTopic(t)}
                className={`btn-sm transition-all ${config.topics.includes(t) ? 'btn-ai' : 'btn-secondary'}`}>{t}</button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div className="mb-4">
          <label className="label">Number of Questions</label>
          <div className="flex gap-2">
            {counts.map(n => (
              <button key={n} onClick={() => setConfig(c => ({ ...c, numQuestions: n }))}
                className={`btn-sm ${config.numQuestions === n ? 'btn-primary' : 'btn-secondary'}`}>{n}</button>
            ))}
          </div>
        </div>

        {/* Mode */}
        <div className="mb-6">
          <label className="label">Interview Mode</label>
          <div className="grid grid-cols-2 gap-3">
            {[{ key: 'Guided', icon: '🎯', desc: 'Hints available, learning-focused' }, { key: 'Simulation', icon: '🔥', desc: 'No hints, timed, real experience' }].map(m => (
              <button key={m.key} onClick={() => setConfig(c => ({ ...c, mode: m.key }))}
                className={`card-glass p-3 text-left transition-all border-2 ${config.mode === m.key ? 'border-brand-500/60' : 'border-transparent'}`}>
                <span className="text-xl">{m.icon}</span>
                <div className="font-semibold text-sm mt-1">{m.key}</div>
                <div className="text-text-secondary text-xs mt-0.5">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => onStart(config)} className="btn-primary btn-md w-full">
          <Zap size={16} /> Start Interview
        </button>
      </motion.div>
    </div>
  )
}

// ── Question Card ────────────────────────────────────────────────────────────
function QuestionCard({ question, answer, onAnswerChange, mode, onGetHint, hint, hintUsed }) {
  return (
    <motion.div key={question.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
      className="card-glass p-6">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="badge-ghost">Q{question.id}</span>
        <span className="badge-brand">{question.topic}</span>
        <DiffBadge diff={question.difficulty} />
        <span className={`badge-ghost`}>{question.type === 'coding' ? <><Code2 size={10} className="mr-1" />Coding</> : <><MessageSquare size={10} className="mr-1" />Theory</>}</span>
      </div>
      <p className="text-text-primary text-base leading-relaxed mb-5">{question.text}</p>

      {question.type === 'coding' ? (
        <div className="editor-wrapper mb-4">
          <div className="editor-topbar">
            <div className="flex gap-1.5">
              <span className="editor-dot bg-[#FF5F56]" /><span className="editor-dot bg-[#FFBD2E]" /><span className="editor-dot bg-[#27C93F]" />
            </div>
            <span className="text-text-tertiary text-xs font-mono">Java • Solution.java</span>
          </div>
          <textarea
            value={answer} onChange={e => onAnswerChange(e.target.value)}
            className="w-full font-mono text-sm text-text-primary p-4 resize-none focus:outline-none"
            style={{ background: '#0D1117', minHeight: 300, caretColor: '#6248FF' }}
            placeholder="// Write your solution here..."
            spellCheck={false}
          />
        </div>
      ) : (
        <textarea value={answer} onChange={e => onAnswerChange(e.target.value)}
          className="input-base resize-none mb-4 font-sans text-sm"
          rows={6} placeholder="Type your answer here..." />
      )}

      {/* Hint panel (Guided only) */}
      {mode === 'Guided' && (
        <AnimatePresence>
          {hint ? (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="alert-ai mt-2">
              <Lightbulb size={16} className="text-ai-400 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-semibold text-ai-400 mb-1">AI Hint</div>
                <div className="text-sm text-text-primary">{hint}</div>
              </div>
            </motion.div>
          ) : (
            <button onClick={onGetHint}
              className={`btn-ai btn-sm mt-1 ${hintUsed ? 'opacity-60' : ''}`}>
              <Lightbulb size={14} /> {hintUsed ? 'Hint Used' : 'Get Hint'}
            </button>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  )
}

// ── Session Report ───────────────────────────────────────────────────────────
function SessionReport({ report, onRetry, onDashboard }) {
  const { score, questions, mode, timeTaken, hintsUsed } = report
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
      {/* Score hero */}
      <div className="card-glass p-8 text-center">
        <div className="relative inline-flex items-center justify-center mb-4">
          <ScoreRing score={score} size={140} strokeWidth={12} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black">{score}</span>
            <span className="text-text-secondary text-sm">/ 100</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-1">
          {score >= 75 ? '🎉 Excellent!' : score >= 50 ? '👍 Good Job!' : '📚 Keep Practicing!'}
        </h2>
        <p className="text-text-secondary">
          {score >= 75 ? 'You demonstrated strong knowledge across topics.' : score >= 50 ? 'Solid performance with room to grow.' : 'Focus on fundamentals and practice more.'}
        </p>
        <div className="flex items-center justify-center gap-6 mt-4 text-sm text-text-secondary">
          <span><Clock size={14} className="inline mr-1" />{timeTaken}</span>
          {mode === 'Guided' && <span><Lightbulb size={14} className="inline mr-1" />Hints used: {hintsUsed}/{questions.length}</span>}
          <span><CheckCircle size={14} className="inline mr-1" />{questions.length} questions</span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="card-glass overflow-hidden">
        <div className="p-4 border-b border-border-subtle">
          <h3 className="font-semibold">Question Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border-subtle">
              {['Q#', 'Topic', 'Type', 'Score', 'Feedback'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-text-secondary font-medium">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {questions.map((q, i) => (
                <tr key={i} className="border-b border-border-subtle/50 hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 font-mono text-text-secondary">{i + 1}</td>
                  <td className="px-4 py-3"><span className="badge-brand">{q.topic}</span></td>
                  <td className="px-4 py-3 text-text-secondary">{q.type}</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${q.score >= 75 ? 'text-green-400' : q.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{q.score}%</span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-xs max-w-xs truncate">{q.feedback}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Verdict */}
      <div className="card-glass p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={18} className="text-ai-400" />
          <h3 className="font-semibold">AI Verdict</h3>
          <span className="badge-ai">AI Analysis</span>
        </div>
        <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
          <p>Your performance shows strong conceptual understanding, particularly in OOP and SQL where you scored above 75%. The explanations were clear and well-structured, demonstrating practical knowledge beyond just theory.</p>
          <p>The main area needing improvement is algorithmic problem-solving, specifically linked list operations and dynamic programming. These topics require more pattern recognition practice on platforms like LeetCode or HackerRank.</p>
          <p>System design responses need more depth around scalability trade-offs. Consider studying real-world architecture patterns and practicing whiteboard-style explanations to structure your thoughts more systematically.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-5">
          <div>
            <h4 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2">Strengths</h4>
            {['OOP Concepts', 'SQL Joins', 'Code Readability'].map(s => (
              <div key={s} className="flex items-center gap-2 text-sm text-text-secondary mb-1">
                <CheckCircle size={12} className="text-green-400" />{s}
              </div>
            ))}
          </div>
          <div>
            <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Areas to Improve</h4>
            {['Linked Lists', 'System Design', 'Time Complexity'].map(s => (
              <div key={s} className="flex items-center gap-2 text-sm text-text-secondary mb-1">
                <AlertCircle size={12} className="text-red-400" />{s}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card-glass p-6">
        <h3 className="font-semibold mb-4">Improvement Recommendations</h3>
        <div className="space-y-3">
          {[
            { title: 'Practice Linked List Problems', link: '/practice?topic=linked-lists', desc: 'Solve 15 curated problems covering cycle detection, reversal, and merge operations.' },
            { title: 'Study System Design Basics', link: '/courses?q=system-design', desc: 'Take the System Design Fundamentals course to build a structured approach.' },
            { title: 'Mock Interview: Simulation Mode', link: '/interview', desc: 'Challenge yourself with a timed simulation to build confidence under pressure.' },
          ].map((r, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-border-subtle">
              <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-brand-400 text-xs font-bold">{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <a href={r.link} className="text-sm font-medium text-text-primary hover:text-brand-300 transition-colors">{r.title}</a>
                <p className="text-xs text-text-secondary mt-0.5">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={onRetry} className="btn-primary btn-md"><RefreshCw size={16} />Retry Interview</button>
        <button className="btn-secondary btn-md"><Share2 size={16} />Share Report</button>
        <button onClick={onDashboard} className="btn-ghost btn-md"><ArrowLeft size={16} />Back to Dashboard</button>
      </div>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function MockInterview() {
  const navigate = useNavigate()
  const { id } = useParams()

  // States
  const [view, setView] = useState('list') // 'list' | 'active' | 'report'
  const [showSetup, setShowSetup] = useState(false)
  const [sessions, setSessions] = useState(MOCK_SESSIONS)
  const [loading, setLoading] = useState(false)
  const [resumeBanner, setResumeBanner] = useState(false)

  // Active session state
  const [session, setSession] = useState(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState({})
  const [hints, setHints] = useState({})
  const [hintUsed, setHintUsed] = useState({})
  const [flagged, setFlagged] = useState({})
  const [elapsed, setElapsed] = useState(0)
  const [report, setReport] = useState(null)
  const timerRef = useRef(null)

  // Check localStorage for in-progress session
  useEffect(() => {
    const saved = localStorage.getItem('skillbridge_interview_session')
    if (saved) setResumeBanner(true)
  }, [])

  // Fetch past sessions
  useEffect(() => {
    interviewAPI.getSessions().then(r => setSessions(r.data)).catch(() => {})
  }, [])

  // Timer
  useEffect(() => {
    if (view === 'active') {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [view])

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const handleStart = async (config) => {
    setShowSetup(false)
    setLoading(true)
    try {
      const res = await interviewAPI.createSession(config)
      setSession({ ...config, questions: MOCK_QUESTIONS.slice(0, config.numQuestions / 5), id: res.data?.id || 'mock' })
    } catch {
      setSession({ ...config, questions: MOCK_QUESTIONS, id: 'mock' })
    }
    setAnswers({}); setHints({}); setHintUsed({}); setFlagged({}); setCurrentQ(0); setElapsed(0)
    localStorage.setItem('skillbridge_interview_session', JSON.stringify({ config, started: Date.now() }))
    setView('active')
    setLoading(false)
  }

  const handleGetHint = () => {
    const q = session.questions[currentQ]
    setHints(h => ({ ...h, [currentQ]: q.hint }))
    setHintUsed(h => ({ ...h, [currentQ]: true }))
  }

  const handleSubmit = async () => {
    const q = session.questions[currentQ]
    try { await interviewAPI.submitAnswer(session.id, { questionId: q.id, answer: answers[currentQ] || '' }) } catch {}
    if (currentQ < session.questions.length - 1) { setCurrentQ(c => c + 1) }
    else { handleEndSession() }
  }

  const handleEndSession = async () => {
    clearInterval(timerRef.current)
    try { await interviewAPI.endSession(session.id) } catch {}
    localStorage.removeItem('skillbridge_interview_session')
    // Build mock report
    const qs = session.questions.map((q, i) => ({
      ...q, score: Math.floor(55 + Math.random() * 45),
      feedback: ['Great explanation with examples.', 'Partial understanding shown.', 'Missing edge cases.', 'Well-structured answer.', 'Could go deeper on scalability.'][i % 5]
    }))
    const avg = Math.round(qs.reduce((a, b) => a + b.score, 0) / qs.length)
    setReport({ score: avg, questions: qs, mode: session.mode, timeTaken: formatTime(elapsed), hintsUsed: Object.keys(hintUsed).length })
    setView('report')
  }

  const handleResume = () => {
    const saved = JSON.parse(localStorage.getItem('skillbridge_interview_session'))
    if (saved) { handleStart(saved.config) }
    setResumeBanner(false)
  }

  const q = session?.questions[currentQ]

  // ── Render list view ───────────────────────────────────────────────────────
  if (view === 'list') return (
    <div className="page-container py-8 space-y-8">
      {/* Resume banner */}
      <AnimatePresence>
        {resumeBanner && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="alert-ai flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Zap size={16} className="text-ai-400" />
              <span>You have an in-progress interview session.</span>
            </div>
            <div className="flex gap-2">
              <button onClick={handleResume} className="btn-ai btn-sm">Resume</button>
              <button onClick={() => { localStorage.removeItem('skillbridge_interview_session'); setResumeBanner(false) }} className="btn-ghost btn-sm"><X size={14} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="section-title mb-0">AI Mock Interview</h1>
            <span className="ai-tag">AI Powered</span>
          </div>
          <p className="section-sub">Practice interviews tailored to your roadmap and goals</p>
        </div>
        <button onClick={() => setShowSetup(true)} className="btn-primary btn-md">
          <Plus size={16} />New Session
        </button>
      </motion.div>

      {/* Mode cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { icon: '🎯', title: 'Guided Mock', badge: 'Learning', desc: 'Questions from your roadmap topics. Hints available. Learning-focused experience designed to help you understand your weak areas.', color: 'brand' },
          { icon: '🔥', title: 'Interview Simulation', badge: 'Real Experience', desc: 'Full interview experience. No hints. Timed. Detailed performance report at the end. Test yourself under real conditions.', color: 'ai' },
        ].map((m, i) => (
          <motion.div key={m.title} custom={i} variants={fadeUp} initial="hidden" animate="visible"
            className="card-glass-hover p-6 cursor-pointer" onClick={() => setShowSetup(true)}>
            <div className="flex items-start gap-4">
              <div className="text-4xl">{m.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-base">{m.title}</h3>
                  <span className={m.color === 'brand' ? 'badge-brand' : 'badge-ai'}>{m.badge}</span>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed">{m.desc}</p>
                <button className={`mt-4 btn-sm ${m.color === 'brand' ? 'btn-primary' : 'btn-ai'}`}>
                  Start <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent sessions */}
      <div>
        <h2 className="font-semibold text-lg mb-4">Recent Sessions</h2>
        {sessions.length === 0 ? (
          <div className="card-glass p-12 text-center">
            <Brain size={40} className="mx-auto text-text-disabled mb-3" />
            <p className="text-text-secondary">No sessions yet. Start your first mock interview!</p>
            <button onClick={() => setShowSetup(true)} className="btn-primary btn-md mt-4"><Plus size={16} />New Session</button>
          </div>
        ) : (
          <div className="card-glass overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border-subtle">
                  {['Date', 'Role', 'Mode', 'Score', 'Questions', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-text-secondary font-medium">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {sessions.map((s, i) => (
                    <motion.tr key={s.id || i} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                      className="border-b border-border-subtle/50 hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3 text-text-secondary">{s.date}</td>
                      <td className="px-4 py-3 font-medium">{s.role}</td>
                      <td className="px-4 py-3">
                        <span className={s.mode === 'Guided' ? 'badge-brand' : 'badge-warning'}>{s.mode}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${s.score >= 75 ? 'text-green-400' : s.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{s.score}%</span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{s.questions}</td>
                      <td className="px-4 py-3">
                        <button className="btn-secondary btn-sm"><Eye size={12} />View Report</button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Setup modal */}
      <AnimatePresence>
        {showSetup && <SetupModal onClose={() => setShowSetup(false)} onStart={handleStart} />}
      </AnimatePresence>
    </div>
  )

  // ── Render active session ──────────────────────────────────────────────────
  if (view === 'active' && session) return (
    <div className="page-container py-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={session.mode === 'Guided' ? 'badge-brand' : 'badge-warning'}>{session.mode === 'Guided' ? '🎯 Guided' : '🔥 Simulation'}</span>
            <span className="text-text-secondary text-sm">{session.role} • {session.experience}</span>
          </div>
          <h2 className="font-bold text-lg">Question {currentQ + 1} of {session.questions.length}</h2>
        </div>
        <div className="flex items-center gap-4">
          {/* Timer */}
          <div className="flex items-center gap-2 card-glass px-4 py-2 rounded-xl">
            <Clock size={15} className={session.mode === 'Simulation' ? 'text-warning' : 'text-ai-400'} />
            <span className="font-mono text-sm font-semibold">
              {session.mode === 'Simulation' ? formatTime(elapsed) : 'No limit'}
            </span>
          </div>
          <button onClick={handleEndSession} className="btn-danger btn-sm">End Session</button>
        </div>
      </div>

      {/* Dot progress */}
      <div className="flex items-center gap-1.5 mb-6 flex-wrap">
        {session.questions.map((_, i) => (
          <button key={i} onClick={() => setCurrentQ(i)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${i === currentQ ? 'bg-brand-500 scale-125' : i < currentQ ? 'bg-brand-500/40' : flagged[i] ? 'bg-warning' : 'bg-bg-tertiary border border-border-default'}`} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main question */}
        <div className="lg:col-span-3 space-y-4">
          <AnimatePresence mode="wait">
            {q && (
              <QuestionCard
                key={currentQ}
                question={q}
                answer={answers[currentQ] || ''}
                onAnswerChange={v => setAnswers(a => ({ ...a, [currentQ]: v }))}
                mode={session.mode}
                onGetHint={handleGetHint}
                hint={hints[currentQ]}
                hintUsed={hintUsed[currentQ]}
              />
            )}
          </AnimatePresence>

          {/* Action bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-2">
              <button onClick={() => currentQ > 0 && setCurrentQ(c => c - 1)} disabled={currentQ === 0}
                className="btn-secondary btn-md"><ChevronLeft size={16} />Prev</button>
            </div>
            <div className="flex gap-2">
              {session.mode === 'Simulation' ? (
                <button onClick={() => setFlagged(f => ({ ...f, [currentQ]: !f[currentQ] }))}
                  className={`btn-sm ${flagged[currentQ] ? 'btn-warning' : 'btn-secondary'}`}>
                  <Flag size={14} />{flagged[currentQ] ? 'Flagged' : 'Flag'}
                </button>
              ) : (
                <button onClick={() => setCurrentQ(c => Math.min(c + 1, session.questions.length - 1))}
                  className="btn-secondary btn-md"><SkipForward size={16} />Skip</button>
              )}
              <button onClick={handleSubmit} className="btn-primary btn-md">
                {currentQ < session.questions.length - 1 ? <><Send size={16} />Submit & Next</> : <><Trophy size={16} />Finish</>}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block">
          <div className="card-glass p-4 sticky top-6">
            <h3 className="font-semibold text-sm mb-3">Questions</h3>
            <div className="space-y-1.5">
              {session.questions.map((sq, i) => (
                <button key={i} onClick={() => setCurrentQ(i)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all duration-150 flex items-center justify-between gap-2
                    ${i === currentQ ? 'bg-brand-500/15 text-brand-300 border border-brand-500/25' : 'text-text-secondary hover:text-text-primary hover:bg-white/4'}`}>
                  <span>Q{i + 1}. {session.mode === 'Simulation' && i > currentQ
                    ? <span className="blur-sm select-none">████████████</span>
                    : sq.topic}</span>
                  {answers[i] && <CheckCircle size={10} className="text-green-400 flex-shrink-0" />}
                  {flagged[i] && <Flag size={10} className="text-warning flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ── Render report ──────────────────────────────────────────────────────────
  if (view === 'report' && report) return (
    <div className="page-container py-8">
      <SessionReport report={report} onRetry={() => { setView('list'); setShowSetup(true) }} onDashboard={() => navigate('/home')} />
    </div>
  )

  return (
    <div className="page-container py-8 flex items-center justify-center min-h-96">
      <div className="text-center">
        <div className="skeleton w-12 h-12 mx-auto mb-4 rounded-full" />
        <p className="text-text-secondary">Loading...</p>
      </div>
    </div>
  )
}
