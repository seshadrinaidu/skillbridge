import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, CheckCircle2, Circle, Code2, Eye, Target, Zap } from 'lucide-react'

const exercises = [
  {
    id: 'prediction',
    label: 'Output prediction',
    title: 'Predict Java collection behavior',
    prompt: 'What is printed by this code?',
    code: `Set<Integer> values = new LinkedHashSet<>();
values.add(3);
values.add(1);
values.add(3);
System.out.println(values);`,
    options: ['[3, 1, 3]', '[3, 1]', '[1, 3]', '[ ]'],
    answer: 1,
  },
  {
    id: 'concept',
    label: 'Concept exercise',
    title: 'Choose the best HashMap operation',
    prompt: 'You must find whether a complement already appeared. Which operation has the best typical complexity?',
    code: '',
    options: ['containsKey(key)', 'Search a linked list', 'Sort then binary search', 'Nested loop'],
    answer: 0,
  },
]

export default function LearningLab() {
  const [activeId, setActiveId] = useState(exercises[0].id)
  const [selected, setSelected] = useState({})
  const [completed, setCompleted] = useState([])
  const [feedback, setFeedback] = useState({})

  const active = exercises.find(item => item.id === activeId)
  const selectedIndex = selected[active.id]

  const submit = () => {
    if (selectedIndex === undefined) return
    if (selectedIndex === active.answer) {
      setCompleted(items => items.includes(active.id) ? items : [...items, active.id])
      setFeedback(previous => ({ ...previous, [active.id]: 'correct' }))
    } else {
      setFeedback(previous => ({ ...previous, [active.id]: 'retry' }))
    }
  }

  return (
    <div className="page-container py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
        <div>
          <p className="micro-label">Practical learning</p>
          <h1 className="text-3xl font-bold text-text-primary mt-2">Learning lab</h1>
          <p className="text-sm text-text-secondary mt-1">Concept checks and output prediction tied to your roadmap.</p>
        </div>
        <div className="card-glass px-4 py-3 flex items-center gap-3">
          <Target size={18} className="text-brand-400" />
          <div><strong className="block text-lg">{completed.length}/2</strong><span className="text-xs text-text-secondary">today complete</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
        <aside className="card-glass p-3 h-fit">
          {exercises.map((exercise, index) => (
            <button
              key={exercise.id}
              onClick={() => setActiveId(exercise.id)}
              className={`w-full text-left p-3 rounded-xl border mb-2 last:mb-0 transition-colors ${
                activeId === exercise.id ? 'border-brand-500/50 bg-brand-500/10' : 'border-transparent hover:bg-bg-tertiary'
              }`}
            >
              <div className="flex items-center gap-2">
                {completed.includes(exercise.id) ? <CheckCircle2 size={16} className="text-success" /> : <Circle size={16} className="text-text-tertiary" />}
                <div>
                  <span className="block text-xs text-text-tertiary">{String(index + 1).padStart(2, '0')} · {exercise.label}</span>
                  <strong className="block text-sm text-text-primary mt-1">{exercise.title}</strong>
                </div>
              </div>
            </button>
          ))}
        </aside>

        <motion.div key={active.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-glass p-5 sm:p-7">
          <div className="flex items-center gap-2 mb-5">
            {active.id === 'prediction' ? <Eye size={17} className="text-ai-400" /> : <Brain size={17} className="text-brand-400" />}
            <span className="badge-brand">{active.label}</span>
          </div>
          <h2 className="text-xl font-bold text-text-primary">{active.title}</h2>
          <p className="text-sm text-text-secondary mt-2 mb-5">{active.prompt}</p>
          {active.code && (
            <pre className="rounded-xl border border-border-subtle bg-bg-primary p-4 overflow-x-auto text-sm font-mono text-text-primary mb-5">
              <code>{active.code}</code>
            </pre>
          )}
          <div className="grid gap-2">
            {active.options.map((option, index) => (
              <button
                key={option}
                onClick={() => setSelected(previous => ({ ...previous, [active.id]: index }))}
                className={`w-full min-h-12 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                  selectedIndex === index ? 'border-brand-500 bg-brand-500/10 text-text-primary' : 'border-border-subtle bg-bg-primary text-text-secondary hover:border-border-default'
                }`}
              >
                <span className="mr-3 font-mono text-xs">{String.fromCharCode(65 + index)}</span>{option}
              </button>
            ))}
          </div>

          {completed.includes(active.id) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 rounded-xl border border-success/25 bg-success/10 p-4 text-sm">
              <strong className="text-success">Correct.</strong>
              <span className="text-text-secondary"> This connects directly to the topic in your roadmap.</span>
            </motion.div>
          )}
          {feedback[active.id] === 'retry' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 rounded-xl border border-warning/25 bg-warning/10 p-4 text-sm text-text-secondary">
              Not quite. Revisit the operation complexity and edge case, then try another option.
            </motion.div>
          )}

          <button onClick={submit} disabled={selectedIndex === undefined} className="btn-primary mt-5">
            <Zap size={15} /> Check answer
          </button>
        </motion.div>
      </div>
    </div>
  )
}
