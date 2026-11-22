import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, AlertCircle, ArrowRight } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { authAPI } from '../../lib/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [localError, setLocalError] = useState('')
  const [googleEnabled, setGoogleEnabled] = useState(false)

  useEffect(() => {
    authAPI.oauthStatus()
      .then(({ data }) => setGoogleEnabled(Boolean(data?.googleEnabled)))
      .catch(() => setGoogleEnabled(false))
  }, [])

  const handleChange = (event) => {
    clearError()
    setLocalError('')
    setForm(previous => ({ ...previous, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLocalError('')

    if (!form.email.trim() || !form.password) {
      setLocalError('Enter your email and password.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setLocalError('Enter a valid email address.')
      return
    }

    const result = await login(form)
    if (result.success) {
      navigate(result.user?.role === 'TRAINER' ? '/trainer' : '/home', { replace: true })
    }
  }

  const displayError = localError || error

  return (
    <div className="auth-form">
      <div className="auth-heading">
        <p className="auth-eyebrow">Student & trainer access</p>
        <h2>Sign in</h2>
        <p>New to SkillBridge? <Link to="/register">Create an account</Link></p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <div className="auth-password">
            <input
              id="password"
              name="password"
              type={showPass ? 'text' : 'password'}
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
            <button type="button" onClick={() => setShowPass(value => !value)} aria-label={showPass ? 'Hide password' : 'Show password'}>
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {displayError && (
          <motion.div className="auth-error" role="alert" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
            <AlertCircle size={16} />
            <span>{displayError}</span>
          </motion.div>
        )}

        <button type="submit" className="auth-submit" disabled={isLoading}>
          {isLoading ? <><Loader2 className="auth-spinner" size={18} /> Signing in...</> : <>Sign in <ArrowRight size={18} /></>}
        </button>
      </form>

      <p className="auth-terms">By continuing, you agree to SkillBridge terms of use and privacy policy.</p>
      {googleEnabled && (
        <button type="button" className="auth-submit mt-3" onClick={() => { window.location.assign('/oauth2/authorization/google') }}>
          Continue with Google
        </button>
      )}
      <div className="auth-demo-row" aria-label="Explore without a backend">
        <button type="button" onClick={async () => {
          const result = await login({ demo: true, role: 'STUDENT', email: 'student@skillbridge.demo', password: 'demo' })
          if (result.success) navigate('/home', { replace: true })
        }}>Explore Student demo</button>
        <button type="button" onClick={async () => {
          const result = await login({ demo: true, role: 'TRAINER', email: 'trainer@skillbridge.demo', password: 'demo' })
          if (result.success) navigate('/trainer', { replace: true })
        }}>Explore Trainer demo</button>
      </div>
    </div>
  )
}
