import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, BookOpen, Map, Code2, Mic, BarChart3, Users, GraduationCap,
  Settings, LogOut, Menu, X, Bell, ChevronDown, Zap, Award,
  TrendingUp, Brain, Layers
} from 'lucide-react'
import useAuthStore from '../../store/authStore'

const studentNav = [
  { to: '/home',        icon: Home,       label: 'Dashboard' },
  { to: '/roadmap',     icon: Map,        label: 'My Roadmap' },
  { to: '/practice',    icon: Code2,      label: 'Practice' },
  { to: '/learn',       icon: Brain,      label: 'Learning Lab' },
  { to: '/courses',     icon: BookOpen,   label: 'Courses' },
  { to: '/interview',   icon: Mic,        label: 'Mock Interview' },
  { to: '/placement',   icon: Award,      label: 'Placement' },
  { to: '/performance', icon: TrendingUp, label: 'Performance' },
]

const trainerNav = [
  { to: '/trainer',          icon: Home,       label: 'Dashboard' },
  { to: '/trainer/courses',  icon: BookOpen,   label: 'My Courses' },
  { to: '/trainer/students', icon: Users,      label: 'Students' },
]

export default function AppLayout() {
  const { user } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const isTrainer = user?.role === 'TRAINER'
  const navItems = isTrainer ? trainerNav : studentNav

  const handleLogout = () => {
    setSidebarOpen(false)
    navigate('/logout', { replace: true })
  }

  return (
    <div className="flex h-dvh bg-bg-primary overflow-hidden">
      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden blur-bg"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 z-50 flex flex-col
        bg-bg-secondary border-r border-border-subtle
        transition-transform duration-300 ease-spring
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-border-subtle">
          <Link to={isTrainer ? '/trainer' : '/home'} className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shadow-glow-brand">
              <Brain className="w-4.5 h-4.5 text-white" size={18} />
            </div>
            <span className="font-bold text-base text-text-primary tracking-tight">SkillBridge</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden btn-ghost btn-sm p-1.5 rounded-lg"
          >
            <X size={16} />
          </button>
        </div>

        {/* AI status indicator */}
        <div className="mx-4 mt-4 px-3 py-2 rounded-xl bg-brand-500/5 border border-brand-500/15 flex items-center gap-2">
          <span className="dot-ai animate-pulse-slow" />
          <span className="text-xs text-ai-400 font-medium">AI Mentor Active</span>
          <Zap size={12} className="text-ai-400 ml-auto" />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to || location.pathname.startsWith(to + '/')
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={active ? 'nav-item-active no-underline flex' : 'nav-item no-underline flex'}
              >
                <Icon size={18} className={active ? 'text-brand-400' : ''} />
                <span>{label}</span>
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400"
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User area */}
        <div className="p-3 border-t border-border-subtle">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
            <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{user?.name || 'User'}</p>
              <p className="text-2xs text-text-tertiary capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn-ghost btn-sm w-full justify-start mt-1 text-text-tertiary hover:text-error"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 sm:px-6 h-14 border-b border-border-subtle bg-bg-primary/80 blur-bg sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden btn-ghost btn-sm p-1.5 rounded-lg"
          >
            <Menu size={18} />
          </button>

          {/* Breadcrumb placeholder */}
          <div className="flex-1 lg:flex-none" />

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="btn-ghost btn-sm p-2 rounded-lg relative"
              >
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-500" />
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    className="absolute right-0 top-full mt-2 w-80 card-glass shadow-modal z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-border-subtle">
                      <h3 className="font-semibold text-sm">Notifications</h3>
                    </div>
                    <div className="p-3 space-y-2">
                      {[
                        { icon: '🎯', msg: 'Your daily problem is ready', time: '2m ago' },
                        { icon: '🤖', msg: 'AI feedback on your last submission', time: '1h ago' },
                        { icon: '📈', msg: 'You moved to 72% placement readiness!', time: '3h ago' },
                      ].map((n, i) => (
                        <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/5 cursor-pointer">
                          <span className="text-base">{n.icon}</span>
                          <div>
                            <p className="text-xs text-text-primary">{n.msg}</p>
                            <p className="text-2xs text-text-tertiary mt-0.5">{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User chip */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-bg-secondary border border-border-subtle cursor-pointer hover:border-border-default transition-colors">
              <div className="w-6 h-6 rounded-lg bg-brand-gradient flex items-center justify-center text-white text-xs font-semibold">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-xs font-medium text-text-secondary hidden sm:block">{user?.name}</span>
              <ChevronDown size={12} className="text-text-tertiary" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="min-h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
