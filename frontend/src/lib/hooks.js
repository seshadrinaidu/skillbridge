import { useState, useEffect, useRef, useCallback } from 'react'

// ── useLocalStorage ─────────────────────────────────────────────────────────
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initial
    } catch { return initial }
  })
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
  }, [key, value])
  return [value, setValue]
}

// ── useTimer ────────────────────────────────────────────────────────────────
export function useTimer(running = true) {
  const [elapsed, setElapsed] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setElapsed(e => e + 1), 1000)
    } else {
      clearInterval(ref.current)
    }
    return () => clearInterval(ref.current)
  }, [running])

  const reset = useCallback(() => setElapsed(0), [])
  const fmt = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`
  return { elapsed, fmt, reset }
}

// ── useAsync ────────────────────────────────────────────────────────────────
export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: false, error: null })

  useEffect(() => {
    setState(s => ({ ...s, loading: true, error: null }))
    fn()
      .then(data => setState({ data, loading: false, error: null }))
      .catch(err => setState({ data: null, loading: false, error: err?.message || 'An error occurred' }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}

// ── useDebounce ─────────────────────────────────────────────────────────────
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

// ── useKeyboard ─────────────────────────────────────────────────────────────
export function useKeyboard(keyMap) {
  useEffect(() => {
    const handler = (e) => {
      const key = [
        e.ctrlKey && 'ctrl',
        e.shiftKey && 'shift',
        e.altKey && 'alt',
        e.key
      ].filter(Boolean).join('+')
      if (keyMap[key]) {
        e.preventDefault()
        keyMap[key](e)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [keyMap])
}

// ── useMediaQuery ────────────────────────────────────────────────────────────
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    setMatches(mq.matches)
    const handler = (e) => setMatches(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [query])
  return matches
}

// ── useIsDesktop ─────────────────────────────────────────────────────────────
export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)')
}

// ── useCountUp ───────────────────────────────────────────────────────────────
export function useCountUp(target, duration = 1000) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!target) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return count
}
