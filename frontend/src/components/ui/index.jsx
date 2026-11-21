import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

// ── Spinner ────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', className }) {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-7 h-7', xl: 'w-10 h-10' }
  return (
    <svg
      className={clsx('animate-spin text-brand-500', sizes[size], className)}
      fill="none" viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

// ── Skeleton ────────────────────────────────────────────────────────────────
export function Skeleton({ className, width, height }) {
  return (
    <div
      className={clsx('skeleton', className)}
      style={{ width, height: height || '1rem' }}
    />
  )
}

export function SkeletonCard({ className }) {
  return (
    <div className={clsx('card-glass p-5 space-y-3', className)}>
      <Skeleton height="1.25rem" width="60%" />
      <Skeleton height="0.875rem" width="90%" />
      <Skeleton height="0.875rem" width="75%" />
      <div className="pt-2">
        <Skeleton height="2rem" width="40%" className="rounded-xl" />
      </div>
    </div>
  )
}

// ── Progress Ring ───────────────────────────────────────────────────────────
export function ProgressRing({ value = 0, size = 80, strokeWidth = 6, color = '#6248FF', label, sublabel }) {
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      {label !== undefined && (
        <div className="absolute flex flex-col items-center">
          <span className="font-bold text-text-primary" style={{ fontSize: size * 0.18 }}>{label}</span>
          {sublabel && <span className="text-text-tertiary" style={{ fontSize: size * 0.11 }}>{sublabel}</span>}
        </div>
      )}
    </div>
  )
}

// ── Progress Bar ────────────────────────────────────────────────────────────
export function ProgressBar({ value = 0, height = 6, className, showLabel = false }) {
  return (
    <div className={clsx('progress-bar', className)} style={{ height }}>
      <motion.div
        className="progress-fill h-full"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, value)}%` }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />
      {showLabel && (
        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-2xs text-text-secondary pr-1">
          {value}%
        </span>
      )}
    </div>
  )
}

// ── Difficulty Badge ────────────────────────────────────────────────────────
export function DifficultyBadge({ level }) {
  const map = {
    EASY:   { label: 'Easy',   cls: 'bg-success/15 text-success border-success/25' },
    MEDIUM: { label: 'Medium', cls: 'bg-warning/15 text-warning border-warning/25' },
    HARD:   { label: 'Hard',   cls: 'bg-error/15 text-error border-error/25' },
  }
  const d = map[level?.toUpperCase()] || map.MEDIUM
  return (
    <span className={clsx('badge border', d.cls)}>{d.label}</span>
  )
}

// ── AI Thinking indicator ───────────────────────────────────────────────────
export function AIThinking({ label = 'AI is thinking...' }) {
  return (
    <div className="flex items-center gap-2.5 py-3 px-4 rounded-xl bg-brand-500/5 border border-brand-500/15">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            className="w-1.5 h-1.5 rounded-full bg-ai-500"
          />
        ))}
      </div>
      <span className="text-sm text-ai-400 font-medium animate-ai-thinking">{label}</span>
    </div>
  )
}

// ── Empty State ─────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action, actionLabel }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-bg-tertiary border border-border-subtle flex items-center justify-center mb-4">
          <Icon size={28} className="text-text-tertiary" />
        </div>
      )}
      <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
      {description && <p className="text-sm text-text-secondary mb-6 max-w-xs">{description}</p>}
      {action && (
        <button onClick={action} className="btn-primary btn-md">{actionLabel}</button>
      )}
    </motion.div>
  )
}

// ── Error State ─────────────────────────────────────────────────────────────
export function ErrorState({ title = 'Something went wrong', description, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="text-4xl mb-4">⚠️</div>
      <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
      {description && <p className="text-sm text-text-secondary mb-6 max-w-sm">{description}</p>}
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary btn-md">Try Again</button>
      )}
    </motion.div>
  )
}

// ── Stat Card ───────────────────────────────────────────────────────────────
export function StatCard({ icon: Icon, label, value, change, color = 'brand', className }) {
  const colors = {
    brand:   { icon: 'text-brand-400', bg: 'bg-brand-500/10' },
    ai:      { icon: 'text-ai-400',    bg: 'bg-ai-500/10' },
    success: { icon: 'text-success',   bg: 'bg-success/10' },
    warning: { icon: 'text-warning',   bg: 'bg-warning/10' },
  }
  const c = colors[color] || colors.brand

  return (
    <div className={clsx('card-glass p-5', className)}>
      <div className="flex items-start justify-between mb-3">
        <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center', c.bg)}>
          {Icon && <Icon size={18} className={c.icon} />}
        </div>
        {change !== undefined && (
          <span className={clsx('text-2xs font-semibold', change >= 0 ? 'text-success' : 'text-error')}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-text-primary mb-0.5">{value}</div>
      <div className="text-xs text-text-secondary">{label}</div>
    </div>
  )
}

// ── Topic Tag ───────────────────────────────────────────────────────────────
export function TopicTag({ label, className }) {
  return (
    <span className={clsx('px-2 py-0.5 rounded-lg bg-white/5 border border-border-subtle text-2xs text-text-secondary font-medium', className)}>
      {label}
    </span>
  )
}

// ── XP Badge ────────────────────────────────────────────────────────────────
export function XPBadge({ value }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-2xs font-semibold text-brand-300">
      ⚡ +{value} XP
    </span>
  )
}

// ── Card container ──────────────────────────────────────────────────────────
export function Card({ children, className, hover = false, onClick }) {
  return (
    <motion.div
      whileHover={hover ? { y: -2 } : undefined}
      onClick={onClick}
      className={clsx(hover ? 'card-glass-hover cursor-pointer' : 'card-glass', className)}
    >
      {children}
    </motion.div>
  )
}

// ── Section Header ──────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action, actionLabel, icon: Icon }) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
            <Icon size={16} className="text-brand-400" />
          </div>
        )}
        <div>
          <h2 className="section-title text-base">{title}</h2>
          {subtitle && <p className="section-sub">{subtitle}</p>}
        </div>
      </div>
      {action && (
        <button onClick={action} className="btn-ghost btn-sm text-brand-400 hover:text-brand-300">
          {actionLabel || 'View all'}
        </button>
      )}
    </div>
  )
}

// ── Modal ───────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!open) return null
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 blur-bg"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className={clsx('card-glass shadow-modal w-full', maxWidth)}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-5 border-b border-border-subtle">
            <h2 className="font-semibold text-text-primary">{title}</h2>
            <button onClick={onClose} className="btn-ghost btn-sm p-1.5 rounded-lg text-text-tertiary">✕</button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </motion.div>
    </motion.div>
  )
}

// ── Alert ───────────────────────────────────────────────────────────────────
export function Alert({ type = 'info', title, children, className }) {
  const types = {
    info:    'alert-info',
    success: 'alert-success',
    warning: 'alert-warning',
    error:   'alert-error',
    ai:      'alert-ai',
  }
  return (
    <div className={clsx(types[type], className)}>
      <div>
        {title && <div className="font-semibold mb-0.5">{title}</div>}
        <div className="text-xs opacity-85">{children}</div>
      </div>
    </div>
  )
}

// ── Input Field ─────────────────────────────────────────────────────────────
export function InputField({ label, error, className, ...props }) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <input className={clsx('input-base', error && 'input-error')} {...props} />
      {error && <p className="text-xs text-error mt-1">{error}</p>}
    </div>
  )
}

// ── Select ──────────────────────────────────────────────────────────────────
export function SelectField({ label, error, options = [], className, ...props }) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <select
        className={clsx(
          'input-base appearance-none cursor-pointer',
          error && 'input-error'
        )}
        {...props}
      >
        {options.map(o => (
          <option key={o.value || o} value={o.value || o}>{o.label || o}</option>
        ))}
      </select>
      {error && <p className="text-xs text-error mt-1">{error}</p>}
    </div>
  )
}
