import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts'
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Zap, ArrowRight,
  Brain, Code2, Database, Server, MessageSquare, Layers, BookOpen,
  RefreshCw, ExternalLink, Target, Clock
} from 'lucide-react'
import { placementAPI } from '../../lib/api'

// ── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] } }),
}

// ── Mock data ────────────────────────────────────────────────────────────────
const MOCK_DASHBOARD = {
  overallScore: 72,
  targetRole: 'Backend Developer',
  lastUpdated: '2 hours ago',
  categories: [
    {
      key: 'dsa', label: 'DSA & Problem Solving', icon: Code2, score: 65, color: '#6248FF',
      evidence: ['48 problems solved', '12 medium', '3 hard'],
      missing: null,
      details: { easy: 33, medium: 12, hard: 3, total: 48 },
      link: '/practice?topic=dsa',
    },
    {
      key: 'core', label: 'Core Subjects', icon: BookOpen, score: 78, color: '#00D4D4',
      evidence: ['OOP ✓', 'OS ✓', 'DBMS ✓', 'CN partial'],
      missing: null,
      details: { oopScore: 85, osScore: 72, dbmsScore: 80, cnScore: 60 },
      link: '/courses?q=core-subjects',
    },
    {
      key: 'projects', label: 'Projects', icon: Layers, score: 40, color: '#f59e0b',
      evidence: [],
      missing: 'No projects added yet',
      details: null,
      link: '/profile?tab=projects',
    },
    {
      key: 'communication', label: 'Communication', icon: MessageSquare, score: 55, color: '#a78bfa',
      evidence: ['4 mock interviews', 'Avg score: 55%'],
      missing: null,
      details: null,
      link: '/interview',
    },
    {
      key: 'sql', label: 'SQL & Databases', icon: Database, score: 82, color: '#22c55e',
      evidence: ['24 SQL problems', '3 assessments', 'Avg: 82%'],
      missing: null,
      details: null,
      link: '/practice?topic=sql',
    },
    {
      key: 'systemDesign', label: 'System Design', icon: Server, score: 20, color: '#ef4444',
      evidence: ['2 topics covered'],
      missing: 'Critical gap — only 2 topics covered',
      details: null,
      link: '/courses?q=system-design',
    },
  ],
  recommendations: [
    { id: 1, icon: Code2, title: 'Complete Linked Lists Problem Set', desc: 'You have 0% coverage on linked list problems, a critical DSA topic for backend interviews.', priority: 'High', impact: '+8% DSA score', link: '/practice?topic=linked-lists' },
    { id: 2, icon: Layers, title: 'Add a Backend Project to Profile', desc: 'Recruiters heavily weight projects. Even a REST API project can boost your score significantly.', priority: 'High', impact: '+15% Projects score', link: '/profile?tab=projects' },
    { id: 3, icon: Server, title: 'Start System Design Fundamentals Course', desc: 'System Design is a critical gap. Begin with the basics: load balancers, databases, and caching.', priority: 'High', impact: '+12% System Design score', link: '/courses/system-design-fundamentals' },
    { id: 4, icon: MessageSquare, title: 'Take 2 More Mock Interviews', desc: 'Your communication score can improve with more practice. Try simulation mode for real pressure.', priority: 'Medium', impact: '+6% Communication score', link: '/interview' },
    { id: 5, icon: Brain, title: 'Review CN Topics', desc: 'Computer Networking is partially covered. Review OSI model, TCP/IP, and HTTP fundamentals.', priority: 'Low', impact: '+3% Core Subjects score', link: '/courses?q=networking' },
  ],
  weeklyProgress: [
    { week: 'Week 1', score: 55 },
    { week: 'Week 2', score: 62 },
    { week: 'Week 3', score: 68 },
    { week: 'Week 4', score: 72 },
  ],
  nextActivity: {
    title: 'Complete Binary Trees problem set',
    subtitle: '8 problems • ~2 hours',
    boost: '+5% DSA score',
    link: '/practice?topic=trees',
  },
}

// ── Small score ring ─────────────────────────────────────────────────────────
function MiniRing({ score, color, size = 56 }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={8} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease 0.3s' }} />
    </svg>
  )
}

// ── Priority badge ───────────────────────────────────────────────────────────
function PriorityBadge({ p }) {
  if (p === 'High') return <span className="badge-error">High</span>
  if (p === 'Medium') return <span className="badge-warning">Medium</span>
  return <span className="badge-ghost">Low</span>
}

// ── Category card ────────────────────────────────────────────────────────────
function CategoryCard({ cat, index, navigate }) {
  const isLow = cat.score < 50
  const isCritical = cat.score < 30
  const Icon = cat.icon

  return (
    <motion.div custom={index} variants={fadeUp} initial="hidden" animate="visible"
      className={`card-glass p-5 flex flex-col gap-3 ${isLow ? 'border border-warning/20' : ''} ${isCritical ? '!border-error/30' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${cat.color}20` }}>
            <Icon size={16} style={{ color: cat.color }} />
          </div>
          <span className="font-semibold text-sm truncate">{cat.label}</span>
        </div>
        <div className="relative flex-shrink-0" style={{ width: 56, height: 56 }}>
          <MiniRing score={cat.score} color={cat.color} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-bold text-xs">{cat.score}%</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="progress-bar h-1.5 w-full">
          <div className="progress-fill h-full" style={{ width: `${cat.score}%`, background: `linear-gradient(90deg, ${cat.color}99, ${cat.color})` }} />
        </div>
      </div>

      {/* Evidence pills */}
      <div className="flex flex-wrap gap-1.5">
        {cat.evidence.map((e, i) => (
          <span key={i} className="badge-ghost text-xs">{e}</span>
        ))}
      </div>

      {/* Missing evidence */}
      {cat.missing && (
        <div className="flex items-start gap-1.5 text-xs">
          <AlertTriangle size={12} className={`flex-shrink-0 mt-0.5 ${isCritical ? 'text-red-400' : 'text-orange-400'}`} />
          <span className={isCritical ? 'text-red-400' : 'text-orange-400'}>{cat.missing}</span>
        </div>
      )}

      {/* Improve link */}
      <button onClick={() => navigate(cat.link)} className="btn-ghost btn-sm mt-auto self-start -ml-1 text-xs text-brand-400">
        Improve <ArrowRight size={11} />
      </button>
    </motion.div>
  )
}

// ── Custom tooltip for chart ─────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="card-glass px-3 py-2 text-sm border border-border-default shadow-modal">
      <div className="text-text-secondary text-xs mb-0.5">{label}</div>
      <div className="font-bold text-brand-300">{payload[0].value}%</div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function PlacementDashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState(MOCK_DASHBOARD)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    setLoading(true)
    placementAPI.getDashboard()
      .then(r => setData(r.data))
      .catch(() => {}) // use mock
      .finally(() => setLoading(false))
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    try { const r = await placementAPI.getDashboard(); setData(r.data) } catch {}
    setTimeout(() => setRefreshing(false), 800)
  }

  const scoreColor = data.overallScore >= 75 ? '#22c55e' : data.overallScore >= 50 ? '#f59e0b' : '#ef4444'

  // Gauge data for recharts radial bar
  const gaugeData = [{ name: 'score', value: data.overallScore, fill: scoreColor }]

  return (
    <div className="page-container py-8 space-y-8">
      {/* ── Header ── */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="section-title mb-0">Placement Dashboard</h1>
            <span className="ai-tag">AI Powered</span>
          </div>
          <p className="section-sub">Evidence-based readiness score for your target role</p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing} className="btn-secondary btn-md">
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />Refresh
        </button>
      </motion.div>

      {/* ── Overall readiness card ── */}
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
        className="card-glass p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          {/* Gauge */}
          <div className="relative flex-shrink-0" style={{ width: 200, height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="80%"
                startAngle={180} endAngle={-180} data={[{ value: 100, fill: 'rgba(255,255,255,0.05)' }, ...gaugeData]}>
                <RadialBar dataKey="value" cornerRadius={8} background={false} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black" style={{ color: scoreColor }}>{data.overallScore}%</span>
              <span className="text-text-secondary text-sm mt-1">Ready</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
              <Target size={18} className="text-brand-400" />
              <span className="text-text-secondary text-sm">Target Role:</span>
              <span className="font-semibold text-brand-300">{data.targetRole}</span>
            </div>
            <h2 className="text-3xl font-black mb-2">
              {data.overallScore >= 75 ? '🚀 Interview Ready!' : data.overallScore >= 50 ? '📈 Making Progress' : '🛠️ Needs Work'}
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed max-w-md">
              {data.overallScore >= 75
                ? 'You have strong readiness across most categories. Focus on remaining gaps before applying.'
                : data.overallScore >= 50
                ? 'Good progress overall. Address the highlighted gaps to significantly boost your score.'
                : 'Several critical areas need attention. Follow the AI recommendations to get interview-ready faster.'}
            </p>
            <div className="flex items-center gap-4 mt-4 justify-center sm:justify-start text-xs text-text-tertiary">
              <span className="flex items-center gap-1"><Clock size={12} />Updated {data.lastUpdated}</span>
              <span className="flex items-center gap-1 text-green-400"><TrendingUp size={12} />+5% this week</span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="hidden xl:flex flex-col gap-3">
            {[
              { label: 'DSA Problems', value: '48', color: '#6248FF' },
              { label: 'Mock Interviews', value: '4', color: '#00D4D4' },
              { label: 'Courses Completed', value: '2', color: '#22c55e' },
            ].map(s => (
              <div key={s.label} className="text-right">
                <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
                <div className="text-text-tertiary text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Category grid ── */}
      <div>
        <h2 className="font-semibold text-lg mb-4">Category Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.categories.map((cat, i) => (
            <CategoryCard key={cat.key} cat={cat} index={i} navigate={navigate} />
          ))}
        </div>
      </div>

      {/* ── Next activity + Weekly chart row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Next activity */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible"
          className="lg:col-span-2 card-glass p-6 flex flex-col justify-between gap-4"
          style={{ background: 'linear-gradient(135deg, rgba(98,72,255,0.12) 0%, rgba(0,212,212,0.08) 100%)' }}>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap size={18} className="text-ai-400" />
              <span className="text-sm font-semibold text-ai-400">Highest-Impact Next Step</span>
            </div>
            <h3 className="text-lg font-bold mb-1 leading-snug">{data.nextActivity.title}</h3>
            <p className="text-text-secondary text-sm">{data.nextActivity.subtitle}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={14} className="text-green-400" />
              <span className="text-green-400 text-sm font-semibold">Expected boost: {data.nextActivity.boost}</span>
            </div>
            <button onClick={() => navigate(data.nextActivity.link)} className="btn-primary btn-md w-full">
              Start Now <ArrowRight size={15} />
            </button>
          </div>
        </motion.div>

        {/* Weekly trend chart */}
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible"
          className="lg:col-span-3 card-glass p-6">
          <h3 className="font-semibold mb-4">Placement Score Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data.weeklyProgress} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" tick={{ fill: '#6B7585', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[40, 100]} tick={{ fill: '#6B7585', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine y={75} stroke="#6248FF" strokeDasharray="4 4" strokeOpacity={0.4} label={{ value: 'Target', fill: '#6248FF', fontSize: 10, position: 'right' }} />
              <Line type="monotone" dataKey="score" stroke="#6248FF" strokeWidth={2.5}
                dot={{ r: 4, fill: '#6248FF', stroke: '#080B12', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#00D4D4', stroke: '#080B12', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* ── AI Recommendations ── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-semibold text-lg">AI Recommendations</h2>
          <span className="badge-ai"><Brain size={10} />AI Generated</span>
        </div>
        <div className="space-y-3">
          {data.recommendations.map((rec, i) => {
            const Icon = rec.icon
            return (
              <motion.div key={rec.id} custom={i} variants={fadeUp} initial="hidden" animate="visible"
                className="card-glass-hover p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: rec.priority === 'High' ? 'rgba(239,68,68,0.15)' : rec.priority === 'Medium' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)' }}>
                  <Icon size={18} style={{ color: rec.priority === 'High' ? '#ef4444' : rec.priority === 'Medium' ? '#f59e0b' : '#6B7585' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-semibold text-sm">{rec.title}</span>
                        <PriorityBadge p={rec.priority} />
                      </div>
                      <p className="text-text-secondary text-sm">{rec.desc}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-green-400 text-xs font-semibold mb-2">{rec.impact}</div>
                      <button onClick={() => navigate(rec.link)} className="btn-primary btn-sm">
                        Start <ExternalLink size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
