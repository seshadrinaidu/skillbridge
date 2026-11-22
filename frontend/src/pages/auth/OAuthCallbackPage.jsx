import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircle, Loader2 } from 'lucide-react'
import useAuthStore from '../../store/authStore'

export default function OAuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const restoreSession = useAuthStore(state => state.restoreSession)
  const [error, setError] = useState(searchParams.get('error'))

  useEffect(() => {
    if (error) return
    restoreSession().then(result => {
      if (!result.success) {
        setError('GOOGLE_AUTH_FAILED')
        return
      }
      navigate(result.user?.role === 'TRAINER' ? '/trainer' : '/home', { replace: true })
    })
  }, [error, navigate, restoreSession])

  if (error) {
    return (
      <div className="auth-form text-center">
        <AlertCircle size={32} className="text-error mx-auto mb-3" />
        <h2 className="text-xl font-bold mb-2">Google sign-in failed</h2>
        <p className="text-text-secondary mb-5">{error.replaceAll('_', ' ')}</p>
        <button className="auth-submit" onClick={() => navigate('/login', { replace: true })}>
          Return to sign in
        </button>
      </div>
    )
  }

  return (
    <div className="auth-form text-center">
      <Loader2 className="auth-spinner mx-auto mb-3" size={28} />
      <p className="text-text-secondary">Completing Google sign-in...</p>
    </div>
  )
}
