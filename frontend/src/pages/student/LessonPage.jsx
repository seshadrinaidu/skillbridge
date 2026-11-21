import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, CheckCircle2, ChevronDown, Terminal,
  Eye, EyeOff, BookOpen, List, Play, AlertCircle
} from 'lucide-react'
import { courseAPI } from '../../lib/api'
import useAuthStore from '../../store/authStore'

const MOCK_LESSON = {
  id: 'l1',
  title: 'Two Pointer Technique',
  courseTitle: 'Data Structures & Algorithms Masterclass',
  moduleTitle: 'Arrays & Strings',
  type: 'video',
  completed: false,
  content: `
The **Two Pointer Technique** is a powerful algorithmic pattern used to solve array and string problems efficiently — often reducing O(n²) solutions to O(n).

## Core Idea
Instead of using nested loops, we place two pointers at different positions in the array and move them toward each other (or in the same direction) based on some condition.

## Pattern 1: Opposite Ends
Start one pointer at the beginning and one at the end. Move them inward.

\`\`\`python
def two_sum_sorted(arr, target):
    left, right = 0, len(arr) - 1
    while left < right:
        current = arr[left] + arr[right]
        if current == target:
            return [left, right]
        elif current < target:
            left += 1
        else:
            right -= 1
    return []
\`\`\`

## Pattern 2: Same Direction (Fast & Slow)
Both pointers start at the beginning. The fast pointer moves ahead to find elements, the slow pointer tracks the result.

\`\`\`python
def remove_duplicates(arr):
    if not arr:
        return 0
    slow = 0
    for fast in range(1, len(arr)):
        if arr[fast] != arr[slow]:
            slow += 1
            arr[slow] = arr[fast]
    return slow + 1
\`\`\`
  `,
  codeExample: {
    code: `def is_palindrome(s):
    left, right = 0, len(s) - 1
    while left < right:
        if s[left] != s[right]:
            return False
        left += 1
        right -= 1
    return True

print(is_palindrome("racecar"))
print(is_palindrome("hello"))`,
    answer: 'True\nFalse',
  },
  quiz: [
    {
      id: 'q1',
      question: 'What is the time complexity of the Two Pointer technique for a sorted array?',
      options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(1)'],
      correct: 2,
    },
    {
      id: 'q2',
      question: 'Which problem is NOT typically solved with Two Pointers?',
      options: ['Two Sum (sorted array)', 'Valid Palindrome', 'Binary Search', 'Container With Most Water'],
      correct: 2,
    },
  ],
  outline: [
    'Core Idea',
    'Pattern 1: Opposite Ends',
    'Pattern 2: Same Direction',
    'Output Prediction Exercise',
    'Quiz',
  ],
  prevLesson: { id: 'l1', title: 'Introduction to Arrays' },
  nextLesson: { id: 'l3', title: 'Sliding Window' },
}

function CodeBlock({ code, language = 'python' }) {
  return (
    <div className="editor-wrapper my-4">
      <div className="editor-topbar">
        <div className="flex gap-1.5">
          <div className="editor-dot bg-red-500/70" />
          <div className="editor-dot bg-yellow-500/70" />
          <div className="editor-dot bg-green-500/70" />
        </div>
        <span className="text-xs text-text-tertiary">{language}</span>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono text-text-primary leading-relaxed">
        <code>{code.trim()}</code>
      </pre>
    </div>
  )
}

function OutputPredictor({ exercise }) {
  const [input, setInput] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [correct, setCorrect] = useState(null)

  const handleReveal = () => {
    setRevealed(true)
    if (input.trim()) {
      setCorrect(input.trim() === exercise.answer.trim())
    }
  }

  return (
    <div className="card-glass p-5 my-6 border border-ai-500/20">
      <div className="flex items-center gap-2 mb-3">
        <Terminal size={16} className="text-ai-400" />
        <h3 className="font-semibold text-text-primary">Output Prediction</h3>
        <span className="badge-ai ml-auto">Exercise</span>
      </div>
      <p className="text-text-secondary text-sm mb-3">What does this code output?</p>
      <CodeBlock code={exercise.code} />
      <div className="mt-3 space-y-3">
        <textarea
          className="input-base h-20 resize-none font-mono text-sm"
          placeholder="Type your predicted output here..."
          value={input}
          onChange={e => setInput(e.target.value)}
          aria-label="Predicted output"
          disabled={revealed}
        />
        {!revealed ? (
          <button className="btn-sm btn-ai" onClick={handleReveal}>
            <Eye size={14} /> Reveal Answer
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-4 border ${
              correct === true ? 'bg-success/10 border-success/25' :
              correct === false ? 'bg-error/10 border-error/25' :
              'bg-ai-500/10 border-ai-500/25'
            }`}
          >
            {correct !== null && (
              <div className="flex items-center gap-2 mb-2">
                {correct
                  ? <CheckCircle2 size={16} className="text-success" />
                  : <AlertCircle size={16} className="text-error" />}
                <span className={`font-medium text-sm ${correct ? 'text-success' : 'text-error'}`}>
                  {correct ? 'Correct!' : 'Not quite — here\'s the answer:'}
                </span>
              </div>
            )}
            <pre className="text-ai-400 font-mono text-sm">{exercise.answer}</pre>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function QuizSection({ questions }) {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const score = submitted
    ? questions.filter(q => answers[q.id] === q.correct).length
    : 0

  return (
    <div className="card-glass p-5 my-6 border border-brand-500/20">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen size={16} className="text-brand-400" />
        <h3 className="font-semibold text-text-primary">Lesson Quiz</h3>
        {submitted && (
          <span className={`ml-auto badge ${score === questions.length ? 'badge-success' : score > 0 ? 'badge-warning' : 'badge-error'}`}>
            {score}/{questions.length}
          </span>
        )}
      </div>
      <div className="space-y-5">
        {questions.map((q, qi) => (
          <div key={q.id}>
            <p className="text-sm font-medium text-text-primary mb-3">{qi + 1}. {q.question}</p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => {
                const selected = answers[q.id] === oi
                const isCorrect = oi === q.correct
                const showResult = submitted
                return (
                  <button
                    key={oi}
                    onClick={() => !submitted && setAnswers(a => ({ ...a, [q.id]: oi }))}
                    disabled={submitted}
                    className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${
                      showResult && isCorrect
                        ? 'bg-success/10 border-success/40 text-success'
                        : showResult && selected && !isCorrect
                        ? 'bg-error/10 border-error/40 text-error'
                        : selected
                        ? 'bg-brand-500/15 border-brand-500/40 text-brand-300'
                        : 'bg-bg-tertiary border-border-default text-text-secondary hover:border-border-strong hover:text-text-primary'
                    }`}
                    aria-pressed={selected}
                  >
                    <span className="font-mono text-xs mr-2 opacity-60">{String.fromCharCode(65 + oi)}.</span>
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      {!submitted ? (
        <button
          className="btn-md btn-primary mt-4"
          onClick={() => setSubmitted(true)}
          disabled={Object.keys(answers).length < questions.length}
        >
          Submit Quiz
        </button>
      ) : (
        <button className="btn-md btn-secondary mt-4" onClick={() => { setAnswers({}); setSubmitted(false) }}>
          Retry
        </button>
      )}
    </div>
  )
}

function renderContent(content) {
  const lines = content.trim().split('\n')
  const elements = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith('```')) {
      const lang = line.replace('```', '').trim() || 'code'
      const codeLines = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      elements.push(<CodeBlock key={i} code={codeLines.join('\n')} language={lang} />)
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-lg font-semibold text-text-primary mt-6 mb-3">{line.replace('## ', '')}</h2>)
    } else if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(<p key={i} className="font-semibold text-text-primary mb-2">{line.replace(/\*\*/g, '')}</p>)
    } else if (line.trim()) {
      // Simple bold parsing
      const parts = line.split(/(\*\*[^*]+\*\*)/)
      elements.push(
        <p key={i} className="text-text-secondary text-sm leading-relaxed mb-2">
          {parts.map((p, pi) =>
            p.startsWith('**') ? <strong key={pi} className="text-text-primary">{p.replace(/\*\*/g, '')}</strong> : p
          )}
        </p>
      )
    }
    i++
  }
  return elements
}

export default function LessonPage() {
  const { cid, lid } = useParams()
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [completed, setCompleted] = useState(false)
  const [markingComplete, setMarkingComplete] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await courseAPI.getLesson(cid, lid)
        setLesson(data)
        setCompleted(data.completed)
      } catch (err) {
        if (token?.startsWith('demo-')) {
          setLesson(MOCK_LESSON)
          setCompleted(MOCK_LESSON.completed)
        } else {
          setError(err.response?.data?.message || err.message || 'Unable to load this lesson.')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [cid, lid])

  const handleMarkComplete = async () => {
    setMarkingComplete(true)
    try {
      await courseAPI.completeLesson(cid, lid)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to save lesson completion.')
      setMarkingComplete(false)
      return
    }
    setCompleted(true)
    setMarkingComplete(false)
  }

  if (loading) {
    return (
      <div className="page-container py-8">
        <div className="skeleton h-5 w-64 mb-6" />
        <div className="skeleton h-8 w-96 mb-4" />
        <div className="skeleton h-96 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container py-16 flex flex-col items-center justify-center gap-4">
        <AlertCircle size={48} className="text-error" />
        <p className="text-text-secondary text-center">{error}</p>
        <button className="btn-primary btn-md" onClick={() => window.location.reload()}>Retry</button>
      </div>
    )
  }

  if (!lesson) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-text-tertiary mb-6 flex-wrap" aria-label="Breadcrumb">
        <Link to="/courses" className="hover:text-text-secondary transition-colors">Courses</Link>
        <ChevronRight size={12} />
        <Link to={`/courses/${cid}`} className="hover:text-text-secondary transition-colors truncate max-w-[12rem]">
          {lesson.courseTitle}
        </Link>
        <ChevronRight size={12} />
        <span className="text-text-secondary truncate max-w-[8rem]">{lesson.moduleTitle}</span>
        <ChevronRight size={12} />
        <span className="text-text-primary font-medium truncate max-w-[12rem]">{lesson.title}</span>
      </nav>

      <div className="flex gap-6">
        {/* Main content */}
        <article className="flex-1 min-w-0">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-start justify-between gap-4 mb-6">
              <h1 className="text-2xl font-bold text-text-primary">{lesson.title}</h1>
              <button
                className="lg:hidden btn-ghost btn-sm shrink-0"
                onClick={() => setSidebarOpen(o => !o)}
                aria-label="Toggle outline"
              >
                <List size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="prose-custom">
              {renderContent(lesson.content)}
            </div>

            {/* Output predictor */}
            {lesson.codeExample && <OutputPredictor exercise={lesson.codeExample} />}

            {/* Quiz */}
            {lesson.quiz?.length > 0 && <QuizSection questions={lesson.quiz} />}
          </motion.div>

          {/* Prev / Next */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border-subtle">
            {lesson.prevLesson ? (
              <button
                className="btn-md btn-secondary"
                onClick={() => navigate(`/courses/${cid}/lessons/${lesson.prevLesson.id}`)}
              >
                <ChevronLeft size={15} />
                <span className="hidden sm:inline">{lesson.prevLesson.title}</span>
                <span className="sm:hidden">Prev</span>
              </button>
            ) : <div />}

            {lesson.nextLesson && (
              <button
                className="btn-md btn-primary"
                onClick={() => navigate(`/courses/${cid}/lessons/${lesson.nextLesson.id}`)}
              >
                <span className="hidden sm:inline">{lesson.nextLesson.title}</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight size={15} />
              </button>
            )}
          </div>
        </article>

        {/* Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-6 card-glass p-4">
            <h3 className="font-semibold text-text-primary text-sm mb-3 flex items-center gap-2">
              <List size={15} className="text-brand-400" /> Lesson Outline
            </h3>
            <ul className="space-y-1.5">
              {lesson.outline?.map((item, i) => (
                <li key={i} className="text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer flex items-center gap-2 py-1">
                  <div className="w-1 h-1 rounded-full bg-brand-500/60 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="divider" />

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-text-secondary">
                <span>Module progress</span>
                <span>2 / 4</span>
              </div>
              <div className="progress-bar h-1.5">
                <div className="progress-fill h-full" style={{ width: '50%' }} />
              </div>
            </div>

            <button
              className={`btn-md w-full mt-4 ${completed ? 'btn-secondary' : 'btn-primary'}`}
              onClick={handleMarkComplete}
              disabled={completed || markingComplete}
            >
              {markingComplete ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : completed ? (
                <><CheckCircle2 size={15} className="text-success" /> Completed</>
              ) : (
                <>Mark Complete</>
              )}
            </button>
          </div>
        </aside>
      </div>

      {/* Mobile sticky footer */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-bg-primary border-t border-border-subtle">
        <button
          className={`btn-md w-full ${completed ? 'btn-secondary' : 'btn-primary'}`}
          onClick={handleMarkComplete}
          disabled={completed || markingComplete}
        >
          {markingComplete ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : completed ? (
            <><CheckCircle2 size={15} className="text-success" /> Completed</>
          ) : (
            <>Mark as Complete</>
          )}
        </button>
      </div>
    </div>
  )
}
