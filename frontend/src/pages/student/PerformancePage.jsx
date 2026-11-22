import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  TrendingUp, TrendingDown, Minus, Target, Zap, Flame,
  Trophy, AlertTriangle, CheckCircle2, XCircle, Clock, Code
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { performanceAPI } from '../../lib/api'

const MOCK_STATS = { solved: 142, accuracy: 73, streak: 12, xp: 4820 }
const MOCK_TOPICS = [
  { topic: 'Arrays', attempted: 32, accuracy: 88, avgTime: '14m', trend: 'up' },
  { topic: 'Linked Lists', attempted: 18, accuracy: 72, avgTime: '22m', trend: 'up' },
  { topic: 'Trees', attempted: 25, accuracy: 64, avgTime: '30m', trend: 'down' },
  { topic: 'Graphs', attempted: 12, accuracy: 50, avgTime: '45m', trend: 'down' },
  { topic: 'DP', attempted: 20, accuracy: 45, avgTime: '52m', trend: 'neutral' },
  { topic: 'Strings', attempted: 22, accuracy: 86, avgTime: '12m', trend: 'up' },
  { topic: 'Sorting', attempted: 13, accuracy: 92, avgTime: '10m', trend: 'up' },
]
const MOCK_ACTIVITY = [
  { date: 'Mon', solved: 4 }, { date: 'Tue', solved: 7 }, { date: 'Wed', solved: 2 },
  { date: 'Thu', solved: 9 }, { date: 'Fri', solved: 5 }, { date: 'Sat', solved: 11 }, { date: 'Sun', solved: 6 },
]
const MOCK_TOPIC_SCORES = [
  { topic: 'Arrays', score: 88 }, { topic: 'Strings', score: 86 }, { topic: 'Sorting', score: 92 },
  { topic: 'Linked Lists', score: 72 }, { topic: 'Trees', score: 64 }, { topic: 'Graphs', score: 50 }, { topic: 'DP', score: 45 },
]
const MOCK_DIFFICULTY = [
  { name: 'Easy', value: 68, color: '#22C55E' },
  { name: 'Medium', value: 56, color: '#F59E0B' },
  { name: 'Hard', value: 18, color: '#EF4444' },
]
const MOCK_HISTORY = [
  { id: 'h1', name: 'Two Sum', date: '2026-11-20', status: 'accepted', language: 'Python', runtime: '48ms' },
  { id: 'h2', name: 'Valid Parentheses', date: '2026-11-20', status: 'accepted', language: 'JavaScript', runtime: '52ms' },
  { id: 'h3', name: 'Binary Tree Inorder', date: '2026-11-19', status: 'wrong', language: 'Python', runtime: '—' },
  { id: 'h4', name: 'Longest Substring', date: '2026-11-19', status: 'accepted', language: 'Python', runtime: '62ms' },
  { id: 'h5', name: 'Merge Intervals', date: '2026-11-18', status: 'tle', language: 'Java', runtime: 'TLE' },
]

const TIME_FILTERS = ['This Week', 'This Month', 'All Time']

const statCards = (s) => [
  { label: 'Problems Solved', value: s.solved, icon: Target, color: 'text-brand-400', bg: 'bg-brand-500/10' },
  { label: 'Accuracy', value: `${s.accuracy}%`, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
  { label: 'Day Streak', value: `${s.streak}🔥`, icon: Flame, color: 'text-warning', bg: 'bg-warning/10' },
  { label: 'XP Earned', value: s.xp.toLocaleString(), icon: Trophy, color: 'text-ai-400', bg: 'bg-ai-500/10' },
]

const TrendIcon = ({ trend }) => {
  if (trend === 'up') return <TrendingUp size={14} className="text-success" />
  if (trend === 'down') return <TrendingDown size={14} className="text-error" />
  return <Minus size={14} className="text-text-tertiary" />
}

const StatusBadge = ({ status }) => {
  const map = {
    accepted: 'badge-success',
    wrong: 'badge-error',
    tle: 'badge-warning',
  }
  return <span className={map[status] || 'badge-ghost'}>{status?.toUpperCase()}</span>
}

const chartTooltipStyle = {
  contentStyle: {
    background: '#12181F',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    color: '#F1F3F9',
    fontSize: 12,
  },
  cursor: { fill: 'rgba(98,72,255,0.08)' },
}

export default function PerformancePage() {
  const [timeFilter, setTimeFilter] = useState('This Week')
  const [stats, setStats] = useState(MOCK_STATS)
  const [topics, setTopics] = useState(MOCK_TOPICS)
  const [activity, setActivity] = useState(MOCK_ACTIVITY)
  const [history, setHistory] = useState(MOCK_HISTORY)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [statsRes, topicsRes, histRes] = await Promise.all([
          performanceAPI.get(),
          performanceAPI.getTopicScores(),
          performanceAPI.getHistory({ period: timeFilter }),
        ])
        setStats(statsRes.data || MOCK_STATS)
        setTopics(topicsRes.data?.topics || MOCK_TOPICS)
        setHistory(histRes.data?.history || MOCK_HISTORY)
      } catch (err) {
        setStats({ solved: 0, accuracy: 0, streak: 0, xp: 0 })
        setTopics([])
        setHistory([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [timeFilter])

  const weakAreas = topics.filter(t => t.accuracy < 60)

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title">Performance</h1>
          <p className="text-text-secondary text-sm mt-1">Track your progress and identify weak areas</p>
        </div>
        <div className="flex gap-1 bg-bg-secondary border border-border-subtle rounded-xl p-1">
          {TIME_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`btn-sm ${timeFilter === f ? 'btn-primary' : 'btn-ghost'}`}
              aria-pressed={timeFilter === f}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards(stats).map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card-glass p-4"
          >
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon size={18} className={card.color} />
            </div>
            <p className="text-2xl font-bold text-text-primary">{loading ? '—' : card.value}</p>
            <p className="text-xs text-text-secondary mt-0.5">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-glass p-5 lg:col-span-2"
        >
          <h2 className="font-semibold text-text-primary mb-4">Activity</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={activity}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: '#8B92A5', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8B92A5', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip {...chartTooltipStyle} />
              <Line
                type="monotone"
                dataKey="solved"
                stroke="#6248FF"
                strokeWidth={2}
                dot={{ fill: '#6248FF', r: 4 }}
                activeDot={{ r: 6, fill: '#A08EFF' }}
                name="Problems"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card-glass p-5"
        >
          <h2 className="font-semibold text-text-primary mb-4">Difficulty Split</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={MOCK_DIFFICULTY} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {MOCK_DIFFICULTY.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={chartTooltipStyle.contentStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {MOCK_DIFFICULTY.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-text-secondary">
                <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Topic Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card-glass p-5 mb-8"
      >
        <h2 className="font-semibold text-text-primary mb-4">Topic Scores</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={MOCK_TOPIC_SCORES} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="topic" tick={{ fill: '#8B92A5', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#8B92A5', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip {...chartTooltipStyle} formatter={v => [`${v}%`, 'Score']} />
            <Bar dataKey="score" radius={[6, 6, 0, 0]}>
              {MOCK_TOPIC_SCORES.map((entry, i) => (
                <Cell key={i} fill={entry.score >= 70 ? '#6248FF' : entry.score >= 55 ? '#F59E0B' : '#EF4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Topic Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="card-glass mb-8 overflow-hidden"
      >
        <div className="p-5 border-b border-border-subtle">
          <h2 className="font-semibold text-text-primary">Topic Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-border-subtle">
                {['Topic', 'Attempted', 'Accuracy', 'Avg Time', 'Trend'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topics.map((t, i) => (
                <motion.tr
                  key={t.topic}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.04 }}
                  className="border-b border-border-subtle/50 hover:bg-white/2 transition-colors"
                >
                  <td className="px-5 py-3 font-medium text-text-primary">{t.topic}</td>
                  <td className="px-5 py-3 text-text-secondary">{t.attempted}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="progress-bar h-1.5 w-20">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${t.accuracy}%`,
                            background: t.accuracy >= 70 ? '#22C55E' : t.accuracy >= 55 ? '#F59E0B' : '#EF4444'
                          }}
                        />
                      </div>
                      <span className="text-text-primary">{t.accuracy}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-text-secondary">{t.avgTime}</td>
                  <td className="px-5 py-3"><TrendIcon trend={t.trend} /></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Weak Areas */}
      {weakAreas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="card-glass p-5 mb-8 border border-error/20"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-warning" />
            <h2 className="font-semibold text-text-primary">Weak Areas — Focus Here</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {weakAreas.map(t => (
              <div key={t.topic} className="flex items-center gap-3 bg-error/8 border border-error/20 rounded-xl px-4 py-3">
                <div>
                  <p className="font-medium text-text-primary text-sm">{t.topic}</p>
                  <p className="text-xs text-error mt-0.5">{t.accuracy}% accuracy</p>
                </div>
                <Link
                  to={`/practice?topic=${t.topic}`}
                  className="btn-sm btn-danger ml-2"
                >
                  Practice Now
                </Link>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Submission History */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card-glass overflow-hidden"
      >
        <div className="p-5 border-b border-border-subtle">
          <h2 className="font-semibold text-text-primary">Submission History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-border-subtle">
                {['Problem', 'Date', 'Status', 'Language', 'Runtime'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <motion.tr
                  key={h.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55 + i * 0.04 }}
                  className="border-b border-border-subtle/50 hover:bg-white/2 transition-colors"
                >
                  <td className="px-5 py-3">
                    <Link to={`/practice/${h.id}`} className="font-medium text-text-primary hover:text-brand-300 transition-colors">
                      {h.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-text-secondary">{new Date(h.date).toLocaleDateString()}</td>
                  <td className="px-5 py-3"><StatusBadge status={h.status} /></td>
                  <td className="px-5 py-3">
                    <span className="font-mono text-xs text-text-secondary bg-bg-tertiary px-2 py-0.5 rounded">{h.language}</span>
                  </td>
                  <td className="px-5 py-3 text-text-secondary font-mono text-xs">{h.runtime}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
