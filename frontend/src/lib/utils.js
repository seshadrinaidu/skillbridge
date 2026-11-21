import { clsx } from 'clsx'

export function cn(...inputs) {
  return clsx(inputs)
}

export function formatDate(date, opts = {}) {
  if (!date) return ''
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric', ...opts
  }).format(new Date(date))
}

export function formatRelativeTime(date) {
  const now = new Date()
  const d = new Date(date)
  const diff = now - d
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}

export function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m < 60) return `${m}m ${s}s`
  const h = Math.floor(m / 60)
  const rem = m % 60
  return `${h}h ${rem}m`
}

export function truncate(str, n = 100) {
  if (!str) return ''
  return str.length > n ? str.slice(0, n) + '...' : str
}

export function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export function getDifficultyColor(level) {
  const map = { EASY: '#22C55E', MEDIUM: '#F59E0B', HARD: '#EF4444' }
  return map[level?.toUpperCase()] || '#8B92A5'
}

export function getScoreColor(score) {
  if (score >= 80) return '#22C55E'
  if (score >= 60) return '#F59E0B'
  if (score >= 40) return '#F97316'
  return '#EF4444'
}

export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max)
}

export function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}
