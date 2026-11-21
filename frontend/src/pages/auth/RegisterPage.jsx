import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, AlertCircle, ArrowRight, GraduationCap } from 'lucide-react'
import useAuthStore from '../../store/authStore'

const TARGET_ROLES = [
  { value: 'Frontend Dev', label: 'Frontend Dev' },
  { value: 'Java Backend Developer', label: 'Backend Dev' },
  { value: 'Full Stack Developer', label: 'Full Stack' },
  { value: 'Data Engineer', label: 'Data Engineer' },
  { value: 'DevOps Engineer', label: 'DevOps' },
]

function validate(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Full name is required.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address.'
  if (form.password.length < 8) errors.password = 'Password must be at least 8 characters.'
  if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match.'
  return errors
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const selectedTargetRole = searchParams.get('role') || ''
  const selectedHours = searchParams.get('hours') || ''
  const { register, isLoading, error, clearError } = useAuthStore()

  const [role, setRole] = useState('STUDENT')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    targetRole: selectedTargetRole || 'Java Backend Developer',
    timezone: 'Asia/Kolkata',
  })
  const [fieldErrors, setFieldErrors] = useState({})

  const handleChange = (event) => {
    clearError()
    setFieldErrors(previous => ({ ...previous, [event.target.name]: '' }))
    setForm(previous => ({ ...previous, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const errors = validate(form)
    if (Object.keys(errors).length) {
      setFieldErrors(errors)
      return
    }

    const result = await register({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      role,
      targetRole: role === 'STUDENT' ? form.targetRole : undefined,
      timezone: form.timezone,
    })

    if (result.success) {
      navigate(role === 'TRAINER'
        ? '/trainer'
        : `/onboarding?role=${encodeURIComponent(form.targetRole)}&hours=${encodeURIComponent(selectedHours || '5')}`, { replace: true })
    }
  }

  const passwordStrength = (() => {
    let score = 0
    if (form.password.length >= 8) score++
    if (/[A-Z]/.test(form.password)) score++
    if (/[0-9]/.test(form.password)) score++
    if (/[^A-Za-z0-9]/.test(form.password)) score++
    return score
  })()

  return (
    <div className="auth-form auth-register-form">
      <div className="auth-heading">
        <p className="auth-eyebrow">Free account</p>
        <h2>Create your account</h2>
        <p>Already registered? <Link to="/login">Sign in</Link></p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <fieldset className="auth-role-field">
          <legend>I am a</legend>
          <div className="auth-role-toggle">
            <button type="button" className={role === 'STUDENT' ? 'active' : ''} onClick={() => setRole('STUDENT')} aria-pressed={role === 'STUDENT'}>
              <GraduationCap size={16} /> Student
            </button>
          </div>
        </fieldset>

        <div className="auth-field">
          <label htmlFor="name">Full name</label>
          <input id="name" name="name" type="text" autoComplete="name" value={form.name} onChange={handleChange} placeholder="Jane Doe" aria-invalid={!!fieldErrors.name} />
          {fieldErrors.name && <span className="auth-field-error"><AlertCircle size={13} /> {fieldErrors.name}</span>}
        </div>

        <div className="auth-field">
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} placeholder="you@example.com" aria-invalid={!!fieldErrors.email} />
          {fieldErrors.email && <span className="auth-field-error"><AlertCircle size={13} /> {fieldErrors.email}</span>}
        </div>

        <div className="auth-password-grid">
          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <div className="auth-password">
              <input id="password" name="password" type={showPass ? 'text' : 'password'} autoComplete="new-password" value={form.password} onChange={handleChange} placeholder="Min. 8 characters" aria-invalid={!!fieldErrors.password} />
              <button type="button" onClick={() => setShowPass(value => !value)} aria-label={showPass ? 'Hide password' : 'Show password'}>
                {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {fieldErrors.password && <span className="auth-field-error"><AlertCircle size={13} /> {fieldErrors.password}</span>}
            {form.password && (
              <div className="password-strength" aria-label={`Password strength ${passwordStrength} of 4`}>
                {[1,2,3,4].map(i => <i key={i} className={i <= passwordStrength ? 'filled' : ''} />)}
              </div>
            )}
          </div>

          <div className="auth-field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <div className="auth-password">
              <input id="confirmPassword" name="confirmPassword" type={showConfirm ? 'text' : 'password'} autoComplete="new-password" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" aria-invalid={!!fieldErrors.confirmPassword} />
              <button type="button" onClick={() => setShowConfirm(value => !value)} aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}>
                {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {fieldErrors.confirmPassword && <span className="auth-field-error"><AlertCircle size={13} /> {fieldErrors.confirmPassword}</span>}
          </div>
        </div>

        {role === 'STUDENT' && (
          <fieldset className="auth-target-field">
            <legend>Target role <span>Optional</span></legend>
            <div className="auth-role-chips">
              {TARGET_ROLES.map(option => (
                <button
                  type="button"
                  key={option.value}
                  className={form.targetRole === option.value ? 'active' : ''}
                  onClick={() => setForm(previous => ({ ...previous, targetRole: option.value }))}
                  aria-pressed={form.targetRole === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {error && (
          <motion.div className="auth-error" role="alert" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
            <AlertCircle size={16} /><span>{error}</span>
          </motion.div>
        )}

        <button type="submit" className="auth-submit" disabled={isLoading}>
          {isLoading ? <><Loader2 className="auth-spinner" size={18} /> Creating account...</> : <>Create account <ArrowRight size={18} /></>}
        </button>
      </form>

      <p className="auth-terms">By creating an account, you agree to the terms of use and privacy policy.</p>
      <div className="auth-demo-row">
        <button type="button" onClick={async () => {
          const result = await register({
            demo: true,
            role,
            name: role === 'TRAINER' ? 'Demo Trainer' : 'Alex Student',
            email: 'demo@skillbridge.demo',
            targetRole: form.targetRole,
          })
          if (result.success) navigate(role === 'TRAINER' ? '/trainer' : '/onboarding', { replace: true })
        }}>Try a demo account</button>
      </div>
    </div>
  )
}
