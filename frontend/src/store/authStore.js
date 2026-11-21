import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '../lib/api'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null })
        if (credentials?.demo) {
          const role = credentials.role === 'TRAINER' ? 'TRAINER' : 'STUDENT'
          const user = {
            id: role === 'TRAINER' ? 'trainer-demo' : 'student-demo',
            name: role === 'TRAINER' ? 'Demo Trainer' : 'Alex Student',
            email: role === 'TRAINER' ? 'trainer@skillbridge.demo' : 'student@skillbridge.demo',
            role,
            targetRole: 'Java Backend Developer',
          }
          const token = `demo-${role.toLowerCase()}-session`
          localStorage.setItem('skillbridge_token', token)
          set({ user, token, isLoading: false, error: null })
          return { success: true, user, demo: true }
        }
        try {
          const { data } = await authAPI.login({
            email: credentials.email.trim().toLowerCase(),
            password: credentials.password,
          })
          const token = data?.token || data?.accessToken || data?.jwt
          const profile = data?.user || data?.profile || data
          const user = {
            ...profile,
            name: profile?.fullName || profile?.name,
            targetRole: profile?.targetJobRole || profile?.targetRole,
          }
          if (!token || !user?.role) {
            throw new Error('The server returned an invalid login response.')
          }
          localStorage.setItem('skillbridge_token', token)
          set({ user, token, isLoading: false, error: null })
          return { success: true, user }
        } catch (err) {
          if (credentials?.demo) {
            const role = credentials.role === 'TRAINER' ? 'TRAINER' : 'STUDENT'
            const user = {
              id: role === 'TRAINER' ? 'trainer-demo' : 'student-demo',
              name: role === 'TRAINER' ? 'Demo Trainer' : 'Alex Student',
              email: role === 'TRAINER' ? 'trainer@skillbridge.demo' : 'student@skillbridge.demo',
              role,
              targetRole: 'Java Backend Developer',
            }
            const token = `demo-${role.toLowerCase()}-session`
            localStorage.setItem('skillbridge_token', token)
            set({ user, token, isLoading: false, error: null })
            return { success: true, user, demo: true }
          }
          const msg = err.response?.status === 401
            ? 'Incorrect email or password.'
            : err.response?.status === 403
              ? 'This account does not have permission to sign in.'
              : err.response?.data?.message
                || (err.code === 'ERR_NETWORK' ? 'Cannot reach the server. Please try again.' : err.message)
                || 'Login failed. Please check your credentials.'
          set({ isLoading: false, error: msg })
          return { success: false, error: msg }
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null })
        if (userData?.demo) {
          const role = userData.role === 'TRAINER' ? 'TRAINER' : 'STUDENT'
          const user = {
            id: role === 'TRAINER' ? 'trainer-demo' : 'student-demo',
            name: userData.name || (role === 'TRAINER' ? 'Demo Trainer' : 'Alex Student'),
            email: userData.email || 'demo@skillbridge.demo',
            role,
            targetRole: userData.targetRole || 'Java Backend Developer',
          }
          const token = `demo-${role.toLowerCase()}-session`
          localStorage.setItem('skillbridge_token', token)
          set({ user, token, isLoading: false, error: null })
          return { success: true, user, demo: true }
        }
        try {
          const { data } = await authAPI.register({
            fullName: userData.name || userData.fullName,
            email: userData.email,
            password: userData.password,
            role: userData.role,
            targetJobRole: userData.targetRole || userData.targetJobRole,
            experienceLevel: userData.experienceLevel,
            weeklyStudyHours: userData.weeklyStudyHours,
            timezone: userData.timeZone || userData.timezone,
          })
          const token = data?.token || data?.accessToken || data?.jwt
          const profile = data?.user || data?.profile || data
          const user = {
            ...profile,
            name: profile?.fullName || profile?.name,
            targetRole: profile?.targetJobRole || profile?.targetRole,
          }
          if (!token || !user?.role) {
            throw new Error('The server returned an invalid registration response.')
          }
          localStorage.setItem('skillbridge_token', token)
          set({ user, token, isLoading: false, error: null })
          return { success: true, user }
        } catch (err) {
          if (userData?.demo) {
            const role = userData.role === 'TRAINER' ? 'TRAINER' : 'STUDENT'
            const user = {
              id: role === 'TRAINER' ? 'trainer-demo' : 'student-demo',
              name: userData.name || (role === 'TRAINER' ? 'Demo Trainer' : 'Alex Student'),
              email: userData.email || 'demo@skillbridge.demo',
              role,
              targetRole: userData.targetRole || 'Java Backend Developer',
            }
            const token = `demo-${role.toLowerCase()}-session`
            localStorage.setItem('skillbridge_token', token)
            set({ user, token, isLoading: false, error: null })
            return { success: true, user, demo: true }
          }
          const msg = err.response?.status === 409
            ? 'An account with this email already exists.'
            : err.response?.status === 400
              ? err.response?.data?.message || 'Please check the registration details.'
              : err.response?.data?.message
                || (err.code === 'ERR_NETWORK' ? 'Cannot reach the server. The Spring Boot backend is not running on port 8080.' : err.message)
                || 'Registration failed.'
          set({ isLoading: false, error: msg })
          return { success: false, error: msg }
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await authAPI.logout()
        } catch {
          // Local logout must succeed even if the API is unavailable.
        } finally {
          localStorage.removeItem('skillbridge_token')
          localStorage.removeItem('skillbridge_user')
          set({ user: null, token: null, isLoading: false, error: null })
        }
      },

      setUser: (user) => set({ user }),
      clearError: () => set({ error: null }),

      isAuthenticated: () => !!get().token,
      isStudent: () => get().user?.role === 'STUDENT',
      isTrainer: () => get().user?.role === 'TRAINER',
    }),
    {
      name: 'skillbridge_auth',
      partialize: (s) => ({ user: s.user, token: s.token }),
      onRehydrateStorage: () => (state) => {
        if (state && (!state.token || !state.user)) {
          state.token = null
          state.user = null
        }
      },
    }
  )
)

if (typeof window !== 'undefined') {
  window.addEventListener('skillbridge:unauthorized', () => {
    localStorage.removeItem('skillbridge_token')
    localStorage.removeItem('skillbridge_user')
    useAuthStore.setState({ user: null, token: null, isLoading: false, error: 'Your session has expired. Please sign in again.' })
  })
}

export default useAuthStore
