import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, ArrowUpRight, Check } from 'lucide-react'

export default function AuthLayout() {
  const location = useLocation()
  const isRegister = location.pathname === '/register'

  return (
    <div className="auth-shell">
      <aside className="auth-art" aria-label="SkillBridge overview">
        <Link to="/" className="auth-brand" aria-label="SkillBridge home">
          <span className="auth-brand-mark"><Sparkles size={15} /></span>
          <span>SkillBridge</span>
        </Link>

        <motion.div
          className="auth-art-copy"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .55 }}
        >
          <p className="auth-kicker"><span /> AI learning, made personal</p>
          <h1>{isRegister ? <>Start your<br />placement journey.</> : <>Welcome back.<br />Keep moving.</>}</h1>
          <p className="auth-art-lede">
            {isRegister
              ? 'Turn diagnostic evidence into a focused roadmap, then build your skills one attempt at a time.'
              : 'Your next task, mentor feedback, and interview progress are ready where you left them.'}
          </p>

          <div className="auth-proof">
            <div className="auth-proof-main">
              <strong>68%</strong>
              <span>readiness score</span>
            </div>
            <div className="auth-proof-list">
              {['Personal roadmap', 'Progressive AI hints', 'Evidence-based mocks'].map(item => (
                <span key={item}><Check size={13} /> {item}</span>
              ))}
            </div>
          </div>
        </motion.div>

        <Link className="auth-back" to="/">
          Explore SkillBridge <ArrowUpRight size={14} />
        </Link>
      </aside>

      <main className="auth-panel">
        <Link to="/" className="auth-mobile-brand" aria-label="SkillBridge home">
          <span className="auth-brand-mark"><Sparkles size={15} /></span>
          <span>SkillBridge</span>
        </Link>
        <motion.div
          className="auth-form-wrap"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .38 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}
