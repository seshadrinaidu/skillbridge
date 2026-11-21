import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

export default function LogoutPage() {
  const navigate = useNavigate()
  const logout = useAuthStore(state => state.logout)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    logout().finally(() => {
      navigate('/login', { replace: true })
    })
  }, [logout, navigate])

  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold text-text-primary">Signing you out...</h1>
      <p className="mt-2 text-sm text-text-secondary">Clearing your local session securely.</p>
    </div>
  )
}
