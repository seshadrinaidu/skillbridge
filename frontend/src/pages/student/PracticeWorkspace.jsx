import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Send, ChevronDown, ChevronUp, ChevronRight, Lock, Unlock,
  Lightbulb, Target, Search, Clock, Maximize2, Minimize2, Settings,
  Code2, CheckCircle2, XCircle, AlertCircle, Loader2, Sparkles,
  RotateCcw, MemoryStick, Zap, Eye, EyeOff, History, Terminal,
  ArrowLeft, BookOpen, BrainCircuit, TrendingUp, ChevronLeft,
  Cpu, Trophy, Star, Layers
} from 'lucide-react'
import { practiceAPI } from '../../lib/api'
import useAuthStore from '../../store/authStore'

// ─── Mock Data ───────────────────────────────────────────────────────────────
const MOCK_PROBLEM = {
  id: 'two-sum',
  number: 1,
  title: 'Two Sum',
  difficulty: 'Easy',
  xp: 50,
  topics: ['Arrays', 'HashMap'],
  description: `Given an array of integers \`nums\` and an integer \`target\`, return **indices** of the two numbers such that they add up to target.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
  examples: [
    {
      input: 'nums = [2,7,11,15], target = 9',
      output: '[0,1]',
      explanation: 'Because nums[0] + nums[1] == 2 + 7 == 9, we return [0, 1].',
    },
    {
      input: 'nums = [3,2,4], target = 6',
      output: '[1,2]',
      explanation: 'nums[1] + nums[2] == 2 + 4 == 6.',
    },
    {
      input: 'nums = [3,3], target = 6',
      output: '[0,1]',
      explanation: 'nums[0] + nums[1] == 3 + 3 == 6.',
    },
  ],
  constraints: [
    '2 ≤ nums.length ≤ 10⁴',
    '-10⁹ ≤ nums[i] ≤ 10⁹',
    '-10⁹ ≤ target ≤ 10⁹',
    'Only one valid answer exists.',
  ],
  hints: [
    { level: 1, icon: '🔍', text: 'Think about the approach — a brute-force O(n²) works, but can you do better? What data structure allows O(1) lookup?', xpCost: 0 },
    { level: 2, icon: '💡', text: 'Use a HashMap. For each number, check if (target - num) already exists in the map. If yes, you found your pair. If no, store the current number with its index.', xpCost: 10 },
    { level: 3, icon: '🎯', text: 'Iterate once. At index i, compute complement = target - nums[i]. Check map.containsKey(complement). If true, return [map.get(complement), i]. Otherwise put(nums[i], i).', xpCost: 20 },
  ],
  sampleTests: [
    { id: 1, input: '[2,7,11,15]\n9', expected: '[0,1]' },
    { id: 2, input: '[3,2,4]\n6', expected: '[1,2]' },
    { id: 3, input: '[3,3]\n6', expected: '[0,1]' },
  ],
}

const MOCK_ATTEMPTS = [
  { id: 'a1', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), status: 'WA', language: 'Java', timeTaken: '8:32', code: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // brute force\n        for (int i = 0; i < nums.length; i++)\n            for (int j = i+1; j < nums.length; j++)\n                if (nums[i]+nums[j]==target)\n                    return new int[]{i,j};\n        return new int[]{};\n    }\n}' },
  { id: 'a2', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), status: 'TLE', language: 'Java', timeTaken: '12:14', code: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // still brute force\n        for (int i = 0; i < nums.length; i++)\n            for (int j = i+1; j < nums.length; j++)\n                if (nums[i]+nums[j]==target)\n                    return new int[]{i,j};\n        return null;\n    }\n}' },
]

const BOILERPLATE = {
  Java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        
    }
}`,
  Python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Write your solution here
        pass`,
  'C++': `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        
    }
};`,
}

const LANG_MONACO = { Java: 'java', Python: 'python', 'C++': 'cpp' }

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function timeAgo(date) {
  const diff = Date.now() - date.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

function DifficultyBadge({ difficulty }) {
  const cls = difficulty === 'Easy' ? 'badge-success' : difficulty === 'Medium' ? 'badge-warning' : 'badge-error'
  return <span className={cls}>{difficulty}</span>
}

function StatusBadge({ status }) {
  if (status === 'AC') return <span className="badge-success flex items-center gap-1"><CheckCircle2 size={10} />AC</span>
  if (status === 'WA') return <span className="badge-error flex items-center gap-1"><XCircle size={10} />WA</span>
  return <span className="badge-warning flex items-center gap-1"><AlertCircle size={10} />TLE</span>
}

// ─── Markdown-like renderer ───────────────────────────────────────────────────
function RichText({ text }) {
  const lines = text.split('\n')
  return (
    <div className="text-text-secondary text-sm leading-7 space-y-2">
      {lines.map((line, i) => {
        // Bold
        const processed = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-text-primary font-semibold">$1</strong>')
          .replace(/`(.*?)`/g, '<code class="bg-bg-tertiary border border-border-subtle px-1.5 py-0.5 rounded text-ai-400 font-mono text-xs">$1</code>')
        return <p key={i} dangerouslySetInnerHTML={{ __html: processed }} />
      })}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function PracticeWorkspace() {
  const { problemId } = useParams()
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const [operationError, setOperationError] = useState('')

  // Problem state
  const [problem, setProblem] = useState(null)
  const [loading, setLoading] = useState(true)

  // Editor state
  const [language, setLanguage] = useState('Java')
  const [code, setCode] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const editorRef = useRef(null)
  const monacoRef = useRef(null)

  // Timer
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef(null)

  // Hints
  const [hintsUnlocked, setHintsUnlocked] = useState([1]) // hint 1 always unlocked
  const [hintStartTime] = useState(Date.now())

  // Test / submission
  const [testResults, setTestResults] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState(null)
  const [showTestPanel, setShowTestPanel] = useState(false)

  // AI Feedback
  const [aiFeedback, setAiFeedback] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [showAIPanel, setShowAIPanel] = useState(false)

  // Attempt history
  const [attempts, setAttempts] = useState(MOCK_ATTEMPTS)
  const [showHistory, setShowHistory] = useState(false)

  // Examples
  const [examplesOpen, setExamplesOpen] = useState(true)
  const [constraintsOpen, setConstraintsOpen] = useState(false)

  // Mobile tabs
  const [mobileTab, setMobileTab] = useState('Problem')

  // Divider resize
  const [splitPercent, setSplitPercent] = useState(50)
  const isDragging = useRef(false)
  const containerRef = useRef(null)

  // ── Load problem ────────────────────────────────────────────────────────────
  useEffect(() => {
    const pid = problemId || 'two-sum'
    const savedCode = localStorage.getItem(`sb_code_${pid}`)
    const savedLang = localStorage.getItem(`sb_lang_${pid}`) || 'Java'
    setLanguage(savedLang)

    const fetchProblem = async () => {
      try {
        if (!problemId) throw new Error('no id')
        const res = await practiceAPI.get(problemId)
        setProblem(res.data)
      } catch (err) {
        if (token?.startsWith('demo-')) setProblem(MOCK_PROBLEM)
        else setOperationError(err.response?.data?.message || err.message || 'Unable to load this problem.')
      } finally {
        setLoading(false)
      }
    }

    const fetchAttempts = async () => {
      try {
        const res = await practiceAPI.getAttempts(pid)
        if (res.data?.length) setAttempts(res.data)
      } catch { /* use mock */ }
    }

    fetchProblem()
    fetchAttempts()

    if (savedCode) setCode(savedCode)

    // Start timer
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => {
      clearInterval(timerRef.current)
      const currentCode = editorRef.current?.getValue?.() || ''
      if (currentCode) localStorage.setItem(`sb_code_${pid}`, currentCode)
    }
  }, [problemId])

  // Auto-unlock hints by time
  useEffect(() => {
    const interval = setInterval(() => {
      const minElapsed = (Date.now() - hintStartTime) / 60000
      if (minElapsed >= 5 && !hintsUnlocked.includes(2)) {
        setHintsUnlocked(prev => [...prev, 2])
      }
      if (minElapsed >= 10 && !hintsUnlocked.includes(3)) {
        setHintsUnlocked(prev => [...prev, 3])
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [hintStartTime, hintsUnlocked])

  // Save code on language change
  useEffect(() => {
    const pid = problemId || 'two-sum'
    const savedCode = localStorage.getItem(`sb_code_${pid}_${language}`)
    setCode(savedCode || BOILERPLATE[language])
    localStorage.setItem(`sb_lang_${pid}`, language)
  }, [language, problemId])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleRun() }
      if (e.ctrlKey && e.shiftKey && e.key === 'Enter') { e.preventDefault(); handleSubmit() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  // ── Divider drag ────────────────────────────────────────────────────────────
  const handleDividerMouseDown = (e) => {
    isDragging.current = true
    e.preventDefault()
  }

  useEffect(() => {
    const onMove = (e) => {
      if (!isDragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const pct = ((e.clientX - rect.left) / rect.width) * 100
      setSplitPercent(Math.min(70, Math.max(30, pct)))
    }
    const onUp = () => { isDragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  // ── Actions ─────────────────────────────────────────────────────────────────
  const getCode = () => editorRef.current?.getValue?.() || code

  const handleRun = useCallback(async () => {
    if (isRunning) return
    setIsRunning(true)
    setShowTestPanel(true)
    setTestResults(null)
    const pid = problem?.id || 'two-sum'
    try {
      const res = await practiceAPI.run(pid, { code: getCode(), language })
      setTestResults(res.data)
    } catch (err) {
      if (!token?.startsWith('demo-')) {
        setOperationError(err.response?.data?.message || err.message || 'Code execution is unavailable. Configure a sandbox judge.')
        setIsRunning(false)
        return
      }
      // Mock results
      await new Promise(r => setTimeout(r, 1200))
      const currentCode = getCode()
      const hasMap = currentCode.includes('Map') || currentCode.includes('dict') || currentCode.includes('map')
      setTestResults({
        passed: hasMap ? 3 : 1,
        total: 3,
        cases: MOCK_PROBLEM.sampleTests.map((t, i) => ({
          ...t,
          actual: hasMap ? t.expected : i === 0 ? t.expected : '[Wrong]',
          passed: hasMap || i === 0,
          runtime: `${Math.floor(Math.random() * 5 + 1)}ms`,
          memory: `${Math.floor(Math.random() * 2 + 40)}MB`,
        })),
        runtime: `${Math.floor(Math.random() * 10 + 2)}ms`,
        memory: `${Math.floor(Math.random() * 5 + 40)}MB`,
      })
    }
    setIsRunning(false)
  }, [isRunning, problem, language, code])

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setShowTestPanel(true)
    setTestResults(null)
    const pid = problem?.id || 'two-sum'
    try {
      const res = await practiceAPI.submit(pid, { code: getCode(), language })
      setSubmissionResult(res.data)
      setAttempts(prev => [{ id: `a${Date.now()}`, timestamp: new Date(), status: res.data.status, language, timeTaken: formatTime(elapsed), code: getCode() }, ...prev])
    } catch (err) {
      if (!token?.startsWith('demo-')) {
        setOperationError(err.response?.data?.message || err.message || 'Submission is unavailable until a sandbox judge is configured.')
        setIsSubmitting(false)
        return
      }
      await new Promise(r => setTimeout(r, 1800))
      const currentCode = getCode()
      const hasMap = currentCode.includes('Map') || currentCode.includes('dict') || currentCode.includes('map')
      const result = {
        status: hasMap ? 'AC' : 'WA',
        passed: hasMap ? 1024 : 11,
        total: 1024,
        runtime: hasMap ? '3ms' : '2ms',
        memory: '44MB',
        runtimePercentile: hasMap ? 97.3 : null,
        memoryPercentile: hasMap ? 85.1 : null,
        xpEarned: hasMap ? 50 : 0,
      }
      setSubmissionResult(result)
      setAttempts(prev => [{ id: `a${Date.now()}`, timestamp: new Date(), status: result.status, language, timeTaken: formatTime(elapsed), code: getCode() }, ...prev])
      if (hasMap) {
        // Auto-fetch AI feedback on success
        setTimeout(() => handleGetAIFeedback(pid), 500)
      }
    }
    setIsSubmitting(false)
  }, [isSubmitting, problem, language, elapsed, code])

  const handleGetAIFeedback = useCallback(async (pid) => {
    setAiLoading(true)
    setShowAIPanel(true)
    try {
      const res = await practiceAPI.getAIFeedback(pid || problem?.id || 'two-sum', 'latest')
      setAiFeedback(res.data)
    } catch (err) {
      if (!token?.startsWith('demo-')) {
        setAiFeedback({ feedback: err.response?.data?.message || 'AI feedback is unavailable until the feedback service is configured.' })
        setAiLoading(false)
        return
      }
      await new Promise(r => setTimeout(r, 1500))
      const currentCode = getCode()
      const hasMap = currentCode.includes('Map') || currentCode.includes('dict')
      setAiFeedback({
        assessment: hasMap ? 'correct' : 'needs_improvement',
        complexity: { time: 'O(n)', space: 'O(n)' },
        correctComplexity: { time: 'O(n)', space: 'O(n)' },
        feedback: hasMap
          ? 'Great approach! You correctly identified that a HashMap gives O(1) lookups, reducing overall complexity from O(n²) to O(n). The logic is clean and handles all edge cases.'
          : 'Your brute-force O(n²) solution is correct but too slow for large inputs. Consider using a HashMap to reduce time complexity to O(n) — for each element, store it and check if its complement already exists.',
        errorLine: hasMap ? null : 5,
        errorDetail: hasMap ? null : 'Nested loops cause Time Limit Exceeded on large inputs.',
        evidence: 'In your attempt 3 days ago, you used a similar brute-force approach that resulted in WA/TLE on the same test case.',
        exercise: {
          title: 'Practice: Contains Duplicate',
          description: 'Given an integer array nums, return true if any value appears at least twice.',
          difficulty: 'Easy',
        },
      })
    }
    setAiLoading(false)
  }, [problem, code])

  const handleUnlockHint = (level) => {
    if (hintsUnlocked.includes(level)) return
    setHintsUnlocked(prev => [...prev, level])
    // In a real app: deduct XP here
  }

  const handleLoadAttempt = (attempt) => {
    setCode(attempt.code)
    editorRef.current?.setValue?.(attempt.code)
    setShowHistory(false)
  }

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco

    // Define custom theme
    monaco.editor.defineTheme('skillbridge-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: 'A08EFF', fontStyle: 'bold' },
        { token: 'string', foreground: '86E1A0' },
        { token: 'comment', foreground: '555D6E', fontStyle: 'italic' },
        { token: 'number', foreground: '00D4D4' },
        { token: 'type', foreground: '7DFFFE' },
        { token: 'class-name', foreground: 'F1C97E' },
      ],
      colors: {
        'editor.background': '#0D1117',
        'editor.foreground': '#F1F3F9',
        'editor.lineHighlightBackground': '#12181F',
        'editorLineNumber.foreground': '#3A404F',
        'editorLineNumber.activeForeground': '#6248FF',
        'editor.selectionBackground': '#6248FF40',
        'editorCursor.foreground': '#6248FF',
        'editor.inactiveSelectionBackground': '#6248FF20',
        'editorIndentGuide.background': '#1A2030',
        'editorWidget.background': '#0D1117',
        'editorSuggestWidget.background': '#0D1117',
        'editorSuggestWidget.border': '#1E2740',
        'editorSuggestWidget.selectedBackground': '#6248FF20',
      },
    })
    monaco.editor.setTheme('skillbridge-dark')
    editor.setValue(code || BOILERPLATE[language])
  }

  // ── Render guards ───────────────────────────────────────────────────────────
  if (loading) return <WorkspaceSkeleton />

  if (operationError) {
    return (
      <div className="page-container py-16 flex flex-col items-center justify-center gap-4">
        <AlertCircle size={48} className="text-error" />
        <p className="text-text-secondary text-center">{operationError}</p>
        <button className="btn-primary btn-md" onClick={() => window.location.reload()}>Retry</button>
      </div>
    )
  }

  const prob = problem || MOCK_PROBLEM

  // ── Sub-panels ──────────────────────────────────────────────────────────────
  const ProblemPanel = (
    <div className="h-full overflow-y-auto px-5 py-5 space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-text-tertiary text-xs font-mono">#{prob.number}</span>
          <DifficultyBadge difficulty={prob.difficulty} />
          <span className="badge-ai flex items-center gap-1 ml-auto"><Star size={10} />{prob.xp} XP</span>
        </div>
        <h1 className="text-xl font-bold text-text-primary">{prob.title}</h1>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {prob.topics.map(t => (
            <span key={t} className="px-2 py-0.5 rounded-md text-xs font-medium bg-brand-500/10 text-brand-300 border border-brand-500/20">{t}</span>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="card-glass p-4">
        <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2"><BookOpen size={14} className="text-brand-400" />Description</h2>
        <RichText text={prob.description} />
      </div>

      {/* Examples */}
      <div className="card-glass overflow-hidden">
        <button
          className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold text-text-primary hover:bg-white/5 transition-colors"
          onClick={() => setExamplesOpen(o => !o)}
        >
          <span className="flex items-center gap-2"><Layers size={14} className="text-ai-400" />Examples</span>
          {examplesOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <AnimatePresence>
          {examplesOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-3">
                {prob.examples.map((ex, i) => (
                  <div key={i} className="rounded-xl bg-bg-primary border border-border-subtle p-3 space-y-2">
                    <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">Example {i + 1}</p>
                    <div className="space-y-1">
                      <div className="flex gap-2 text-xs"><span className="text-text-tertiary w-16 shrink-0">Input:</span><code className="text-ai-400 font-mono">{ex.input}</code></div>
                      <div className="flex gap-2 text-xs"><span className="text-text-tertiary w-16 shrink-0">Output:</span><code className="text-brand-300 font-mono">{ex.output}</code></div>
                      {ex.explanation && <div className="flex gap-2 text-xs"><span className="text-text-tertiary w-16 shrink-0">Explain:</span><span className="text-text-secondary">{ex.explanation}</span></div>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Constraints */}
      <div className="card-glass overflow-hidden">
        <button
          className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold text-text-primary hover:bg-white/5 transition-colors"
          onClick={() => setConstraintsOpen(o => !o)}
        >
          <span className="flex items-center gap-2"><Cpu size={14} className="text-warning" />Constraints</span>
          {constraintsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <AnimatePresence>
          {constraintsOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <ul className="px-4 pb-4 space-y-1.5">
                {prob.constraints.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                    <span className="text-brand-400 mt-0.5">•</span>
                    <code className="font-mono">{c}</code>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hints */}
      <div className="card-glass p-4">
        <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2"><Lightbulb size={14} className="text-warning" />Hints</h2>
        <div className="space-y-3">
          {prob.hints.map((hint) => {
            const unlocked = hintsUnlocked.includes(hint.level)
            return (
              <div key={hint.level} className={`relative rounded-xl border transition-all duration-300 overflow-hidden ${unlocked ? 'border-border-default bg-bg-primary' : 'border-border-subtle bg-bg-primary/50'}`}>
                {!unlocked && (
                  <div className="absolute inset-0 backdrop-blur-sm bg-bg-primary/60 z-10 flex flex-col items-center justify-center gap-2">
                    <Lock size={16} className="text-text-tertiary" />
                    <p className="text-xs text-text-tertiary">
                      {hint.xpCost > 0 ? `Deducts ${hint.xpCost} XP` : 'Unlocks after 5 min'}
                    </p>
                    <button
                      className="btn-sm btn-secondary text-xs"
                      onClick={() => handleUnlockHint(hint.level)}
                    >
                      <Unlock size={12} /> Unlock
                    </button>
                  </div>
                )}
                <div className={`p-3 ${!unlocked ? 'blur-sm select-none' : ''}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span>{hint.icon}</span>
                    <span className="text-xs font-semibold text-text-secondary">Hint {hint.level}</span>
                    {hint.xpCost > 0 && <span className="badge-warning ml-auto text-2xs">-{hint.xpCost} XP</span>}
                  </div>
                  <p className="text-xs text-text-secondary leading-5">{unlocked ? hint.text : '████████ ████ ████████████ ████████ ██████'}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Attempt History */}
      <div className="card-glass overflow-hidden">
        <button
          className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold text-text-primary hover:bg-white/5 transition-colors"
          onClick={() => setShowHistory(o => !o)}
        >
          <span className="flex items-center gap-2"><History size={14} className="text-brand-400" />Attempt History <span className="badge-ghost">{attempts.length}</span></span>
          {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <AnimatePresence>
          {showHistory && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              {attempts.length === 0 ? (
                <p className="px-4 pb-4 text-xs text-text-tertiary">No attempts yet. Submit your first solution!</p>
              ) : (
                <div className="px-4 pb-4 space-y-2">
                  {attempts.map((att) => (
                    <div key={att.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-bg-primary border border-border-subtle hover:border-border-default transition-colors cursor-pointer group" onClick={() => handleLoadAttempt(att)}>
                      <StatusBadge status={att.status} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-text-primary font-medium">{att.language}</p>
                        <p className="text-2xs text-text-tertiary">{timeAgo(att.timestamp)} · {att.timeTaken}</p>
                      </div>
                      <span className="text-2xs text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"><RotateCcw size={10} />Load</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )

  const EditorPanel = (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Editor topbar */}
      <div className="editor-topbar flex items-center gap-3 px-4 py-2.5 border-b border-border-subtle shrink-0">
        {/* macOS dots */}
        <div className="flex items-center gap-1.5">
          <span className="editor-dot w-3 h-3 rounded-full bg-red-500/80" />
          <span className="editor-dot w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="editor-dot w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-text-tertiary font-mono flex-1">Solution.{language === 'Java' ? 'java' : language === 'Python' ? 'py' : 'cpp'}</span>

        {/* Language selector */}
        <div className="flex items-center gap-1 bg-bg-primary rounded-lg p-0.5 border border-border-subtle">
          {['Java', 'Python', 'C++'].map(lang => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150 ${language === lang ? 'bg-brand-500/20 text-brand-300' : 'text-text-tertiary hover:text-text-secondary'}`}
            >
              {lang}
            </button>
          ))}
        </div>

        <button className="btn-ghost btn-sm p-1.5 rounded-lg" onClick={() => setIsFullscreen(f => !f)} title="Toggle fullscreen">
          {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={LANG_MONACO[language]}
          value={code}
          onChange={(val) => {
            setCode(val || '')
            const pid = problemId || 'two-sum'
            localStorage.setItem(`sb_code_${pid}`, val || '')
            localStorage.setItem(`sb_code_${pid}_${language}`, val || '')
          }}
          onMount={handleEditorMount}
          options={{
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            fontSize: 14,
            fontLigatures: true,
            lineHeight: 22,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            tabSize: 4,
            wordWrap: 'on',
            padding: { top: 16, bottom: 16 },
            renderLineHighlight: 'line',
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            scrollbar: { vertical: 'hidden', horizontal: 'hidden' },
            glyphMargin: false,
            folding: true,
            lineNumbersMinChars: 3,
            suggest: { showKeywords: true },
            quickSuggestions: true,
          }}
        />
      </div>

      {/* Action bar */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-t border-border-subtle bg-bg-secondary">
        <button
          className="btn-secondary btn-md flex items-center gap-2"
          onClick={handleRun}
          disabled={isRunning || isSubmitting}
        >
          {isRunning ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
          Run Code
        </button>
        <button
          className="btn-primary btn-md flex items-center gap-2"
          onClick={handleSubmit}
          disabled={isRunning || isSubmitting}
        >
          {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Submit
        </button>

        {/* Timer */}
        <div className="flex items-center gap-1.5 ml-auto text-xs text-text-tertiary font-mono">
          <Clock size={12} />
          {formatTime(elapsed)}
        </div>

        {/* Shortcuts */}
        <div className="hidden lg:flex items-center gap-2 text-2xs text-text-tertiary">
          <span className="px-1.5 py-0.5 rounded bg-bg-tertiary border border-border-subtle font-mono">Ctrl+Enter</span>
          <span>Run</span>
          <span className="px-1.5 py-0.5 rounded bg-bg-tertiary border border-border-subtle font-mono">Ctrl+⇧+Enter</span>
          <span>Submit</span>
        </div>
      </div>

      {/* Test Results Panel */}
      <AnimatePresence>
        {showTestPanel && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="shrink-0 overflow-hidden border-t border-border-subtle bg-bg-secondary"
          >
            <div className="max-h-64 overflow-y-auto">
              <div className="flex items-center justify-between px-4 pt-3 pb-2">
                <span className="text-xs font-semibold text-text-primary flex items-center gap-2">
                  <Terminal size={13} className="text-ai-400" />
                  {submissionResult ? 'Submission Result' : 'Test Results'}
                </span>
                <button className="btn-ghost btn-sm p-1" onClick={() => setShowTestPanel(false)}><ChevronDown size={13} /></button>
              </div>

              {(isRunning || isSubmitting) && (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <Loader2 size={24} className="animate-spin text-brand-400" />
                  <p className="text-xs text-text-tertiary animate-pulse">{isSubmitting ? 'Submitting solution...' : 'Running test cases...'}</p>
                </div>
              )}

              {submissionResult && !isSubmitting && (
                <div className="px-4 pb-4 space-y-3">
                  <div className={`alert-base ${submissionResult.status === 'AC' ? 'alert-success' : 'alert-error'} flex items-center gap-3`}>
                    {submissionResult.status === 'AC' ? <CheckCircle2 size={18} className="text-success shrink-0" /> : <XCircle size={18} className="text-error shrink-0" />}
                    <div>
                      <p className="font-semibold">{submissionResult.status === 'AC' ? 'Accepted ✓' : 'Wrong Answer ✗'}</p>
                      <p className="text-xs opacity-80">{submissionResult.passed}/{submissionResult.total} test cases passed</p>
                    </div>
                    {submissionResult.xpEarned > 0 && (
                      <span className="badge-ai ml-auto flex items-center gap-1"><Trophy size={10} />+{submissionResult.xpEarned} XP</span>
                    )}
                  </div>
                  {submissionResult.status === 'AC' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-bg-primary border border-border-subtle p-3 text-center">
                        <p className="text-lg font-bold text-ai-400 font-mono">{submissionResult.runtime}</p>
                        <p className="text-2xs text-text-tertiary mt-0.5">Runtime · faster than {submissionResult.runtimePercentile}%</p>
                      </div>
                      <div className="rounded-lg bg-bg-primary border border-border-subtle p-3 text-center">
                        <p className="text-lg font-bold text-brand-300 font-mono">{submissionResult.memory}</p>
                        <p className="text-2xs text-text-tertiary mt-0.5">Memory · less than {submissionResult.memoryPercentile}%</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {testResults && !submissionResult && !isRunning && (
                <div className="px-4 pb-4 space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold ${testResults.passed === testResults.total ? 'text-success' : 'text-error'}`}>
                      {testResults.passed}/{testResults.total} Passed
                    </span>
                    <span className="text-2xs text-text-tertiary flex items-center gap-1"><Zap size={10} />{testResults.runtime}</span>
                    <span className="text-2xs text-text-tertiary flex items-center gap-1"><MemoryStick size={10} />{testResults.memory}</span>
                  </div>
                  {testResults.cases.map((tc, i) => (
                    <div key={i} className={`rounded-lg border p-3 space-y-1.5 ${tc.passed ? 'border-success/20 bg-success/5' : 'border-error/20 bg-error/5'}`}>
                      <div className="flex items-center gap-2">
                        {tc.passed ? <CheckCircle2 size={12} className="text-success" /> : <XCircle size={12} className="text-error" />}
                        <span className="text-xs font-medium text-text-primary">Case {i + 1}</span>
                        <span className="text-2xs text-text-tertiary ml-auto">{tc.runtime}</span>
                      </div>
                      <div className="text-2xs font-mono space-y-0.5">
                        <div><span className="text-text-tertiary">Input: </span><span className="text-text-secondary">{tc.input}</span></div>
                        <div><span className="text-text-tertiary">Expected: </span><span className="text-success">{tc.expected}</span></div>
                        {!tc.passed && <div><span className="text-text-tertiary">Got: </span><span className="text-error">{tc.actual}</span></div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Feedback Panel */}
      <div className="shrink-0 border-t border-border-subtle bg-bg-secondary">
        <button
          className="w-full px-4 py-2.5 flex items-center gap-2 hover:bg-white/5 transition-colors"
          onClick={() => setShowAIPanel(o => !o)}
        >
          <BrainCircuit size={13} className="text-ai-400" />
          <span className="text-xs font-semibold text-text-primary flex-1 text-left">AI Feedback</span>
          {!aiFeedback && !aiLoading && (
            <button
              className="btn-ai btn-sm text-2xs mr-2"
              onClick={(e) => { e.stopPropagation(); handleGetAIFeedback() }}
            >
              <Sparkles size={10} /> Get Feedback
            </button>
          )}
          {showAIPanel ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
        </button>

        <AnimatePresence>
          {showAIPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="max-h-72 overflow-y-auto px-4 pb-4">
                {aiLoading && (
                  <div className="flex flex-col items-center gap-3 py-8">
                    <div className="relative">
                      <BrainCircuit size={28} className="text-ai-400 animate-ai-thinking" />
                      <div className="absolute inset-0 rounded-full bg-ai-500/20 animate-ping" />
                    </div>
                    <p className="text-xs text-text-tertiary animate-pulse">AI is analyzing your solution...</p>
                  </div>
                )}

                {!aiLoading && !aiFeedback && (
                  <div className="py-6 text-center">
                    <BrainCircuit size={24} className="text-text-tertiary mx-auto mb-2" />
                    <p className="text-xs text-text-tertiary">Run or submit your code to get AI feedback</p>
                    <button className="btn-ai btn-sm mt-3 mx-auto" onClick={() => handleGetAIFeedback()}>
                      <Sparkles size={12} /> Get AI Feedback
                    </button>
                  </div>
                )}

                {!aiLoading && aiFeedback && (
                  <div className="space-y-3">
                    <div className={`alert-ai`}>
                      <div className="flex items-start gap-3 w-full">
                        <Sparkles size={16} className="text-ai-400 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0 space-y-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-text-primary">
                              {aiFeedback.assessment === 'correct' ? '✅ Correct Approach' : '⚠️ Needs Improvement'}
                            </span>
                            <span className="badge-ai text-2xs">AI Analysis</span>
                          </div>

                          <p className="text-sm text-text-secondary leading-6">{aiFeedback.feedback}</p>

                          {/* Complexity */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-lg bg-bg-primary border border-border-subtle p-2.5">
                              <p className="text-2xs text-text-tertiary mb-1">Time Complexity</p>
                              <p className="text-sm font-mono font-bold text-ai-400">{aiFeedback.complexity.time}</p>
                              {aiFeedback.correctComplexity && <p className="text-2xs text-success mt-0.5">Optimal: {aiFeedback.correctComplexity.time}</p>}
                            </div>
                            <div className="rounded-lg bg-bg-primary border border-border-subtle p-2.5">
                              <p className="text-2xs text-text-tertiary mb-1">Space Complexity</p>
                              <p className="text-sm font-mono font-bold text-brand-300">{aiFeedback.complexity.space}</p>
                              {aiFeedback.correctComplexity && <p className="text-2xs text-success mt-0.5">Optimal: {aiFeedback.correctComplexity.space}</p>}
                            </div>
                          </div>

                          {/* Error detail */}
                          {aiFeedback.errorLine && (
                            <div className="rounded-lg bg-error/10 border border-error/20 px-3 py-2.5">
                              <p className="text-xs font-semibold text-error flex items-center gap-1.5"><AlertCircle size={12} />Line {aiFeedback.errorLine}</p>
                              <p className="text-xs text-text-secondary mt-1">{aiFeedback.errorDetail}</p>
                            </div>
                          )}

                          {/* Evidence */}
                          {aiFeedback.evidence && (
                            <div className="rounded-lg bg-bg-primary border border-border-subtle px-3 py-2.5">
                              <p className="text-xs font-semibold text-text-secondary flex items-center gap-1.5"><TrendingUp size={12} className="text-warning" />Pattern Detected</p>
                              <p className="text-xs text-text-tertiary mt-1 italic">{aiFeedback.evidence}</p>
                            </div>
                          )}

                          {/* Exercise */}
                          {aiFeedback.exercise && (
                            <div className="rounded-xl bg-brand-500/10 border border-brand-500/20 px-3 py-2.5">
                              <p className="text-xs font-semibold text-brand-300 flex items-center gap-1.5"><Target size={12} />Try This Next</p>
                              <p className="text-xs text-text-primary mt-1 font-medium">{aiFeedback.exercise.title} <span className="badge-success ml-1">{aiFeedback.exercise.difficulty}</span></p>
                              <p className="text-xs text-text-secondary mt-1">{aiFeedback.exercise.description}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )

  // ── Fullscreen wrapper ──────────────────────────────────────────────────────
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-bg-primary flex flex-col">
        {EditorPanel}
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-bg-primary overflow-hidden">
      {/* Global topbar */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-2.5 border-b border-border-subtle bg-bg-secondary">
        <button className="btn-ghost btn-sm p-1.5 rounded-lg" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 flex items-center gap-2">
          <span className="text-sm font-semibold text-text-primary hidden sm:block">{prob.title}</span>
          <DifficultyBadge difficulty={prob.difficulty} />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-tertiary font-mono">
          <Clock size={12} />
          {formatTime(elapsed)}
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="lg:hidden shrink-0 flex gap-1 px-3 py-2 bg-bg-secondary border-b border-border-subtle">
        {['Problem', 'Editor', 'AI Feedback'].map(tab => (
          <button
            key={tab}
            className={tab === mobileTab ? 'tab-item-active' : 'tab-item'}
            onClick={() => setMobileTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Desktop split layout */}
      <div ref={containerRef} className="hidden lg:flex flex-1 min-h-0 overflow-hidden">
        {/* Left panel */}
        <div className="overflow-hidden border-r border-border-subtle" style={{ width: `${splitPercent}%` }}>
          {ProblemPanel}
        </div>

        {/* Resizable divider */}
        <div
          className="w-1 shrink-0 cursor-col-resize hover:bg-brand-500/40 active:bg-brand-500/60 transition-colors bg-border-subtle relative group"
          onMouseDown={handleDividerMouseDown}
        >
          <div className="absolute inset-y-0 -left-1 -right-1" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-1 rounded-full bg-border-default group-hover:bg-brand-500/60 transition-colors" />
        </div>

        {/* Right panel */}
        <div className="flex-1 overflow-hidden">
          {EditorPanel}
        </div>
      </div>

      {/* Mobile content */}
      <div className="lg:hidden flex-1 min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {mobileTab === 'Problem' && (
            <motion.div key="problem" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="h-full overflow-y-auto">
              {ProblemPanel}
            </motion.div>
          )}
          {mobileTab === 'Editor' && (
            <motion.div key="editor" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="h-full flex flex-col">
              {EditorPanel}
            </motion.div>
          )}
          {mobileTab === 'AI Feedback' && (
            <motion.div key="ai" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="h-full overflow-y-auto px-4 py-5">
              {!aiFeedback ? (
                <div className="card-glass p-8 text-center">
                  <BrainCircuit size={40} className="text-ai-400 mx-auto mb-4 animate-ai-thinking" />
                  <h3 className="text-base font-semibold text-text-primary mb-2">AI Code Mentor</h3>
                  <p className="text-sm text-text-secondary mb-6">Submit your solution or click below to get personalized AI feedback on your approach, complexity, and style.</p>
                  <button className="btn-ai btn-md mx-auto" onClick={() => { setMobileTab('Editor'); setTimeout(handleGetAIFeedback, 100) }}>
                    <Sparkles size={14} /> Get AI Feedback
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="alert-ai">
                    <BrainCircuit size={16} className="text-ai-400 mt-0.5 shrink-0" />
                    <div className="space-y-3">
                      <p className="text-sm font-semibold">{aiFeedback.assessment === 'correct' ? '✅ Correct Approach' : '⚠️ Needs Improvement'}</p>
                      <p className="text-sm text-text-secondary">{aiFeedback.feedback}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-bg-primary border border-border-subtle p-2.5 text-center">
                          <p className="text-2xs text-text-tertiary">Time</p>
                          <p className="text-sm font-mono font-bold text-ai-400">{aiFeedback.complexity.time}</p>
                        </div>
                        <div className="rounded-lg bg-bg-primary border border-border-subtle p-2.5 text-center">
                          <p className="text-2xs text-text-tertiary">Space</p>
                          <p className="text-sm font-mono font-bold text-brand-300">{aiFeedback.complexity.space}</p>
                        </div>
                      </div>
                      {aiFeedback.evidence && (
                        <p className="text-xs text-text-tertiary italic border-l-2 border-brand-500/30 pl-3">{aiFeedback.evidence}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function WorkspaceSkeleton() {
  return (
    <div className="h-screen flex flex-col bg-bg-primary overflow-hidden">
      <div className="shrink-0 h-12 border-b border-border-subtle bg-bg-secondary flex items-center px-4 gap-3">
        <div className="skeleton h-7 w-7 rounded-lg" />
        <div className="skeleton h-5 w-32 rounded" />
        <div className="skeleton h-5 w-16 rounded-full ml-2" />
      </div>
      <div className="flex flex-1 min-h-0">
        <div className="w-1/2 border-r border-border-subtle p-5 space-y-4">
          <div className="skeleton h-6 w-48 rounded" />
          <div className="skeleton h-4 w-32 rounded" />
          <div className="skeleton h-32 w-full rounded-xl" />
          <div className="skeleton h-24 w-full rounded-xl" />
          <div className="skeleton h-20 w-full rounded-xl" />
        </div>
        <div className="flex-1 p-5 space-y-4 flex flex-col">
          <div className="skeleton h-10 w-full rounded-xl" />
          <div className="skeleton flex-1 w-full rounded-xl" />
          <div className="skeleton h-14 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}
