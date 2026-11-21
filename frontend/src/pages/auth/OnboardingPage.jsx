import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, ArrowRight, ArrowLeft, CheckCircle2, Target, Clock,
  Code2, Sparkles, AlertCircle, ChevronRight
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import useAuthStore from '../../store/authStore'
import { assessmentAPI, roadmapAPI } from '../../lib/api'

const roles = [
  { id: 'backend', name: 'Java Backend Developer', icon: '☕', desc: 'Spring Boot, Microservices, System Design, SQL' },
  { id: 'fullstack', name: 'Full Stack Java Developer', icon: '🌐', desc: 'Spring Boot, React, REST APIs, Databases' },
  { id: 'dsa_core', name: 'Software Engineer (DSA Focus)', icon: '⚡', desc: 'Algorithms, Data Structures, Problem Solving' },
  { id: 'cloud_dev', name: 'Cloud & DevOps Engineer', icon: '☁️', desc: 'Docker, Kubernetes, CI/CD, AWS/GCP' }
]

const questions = [
  {
    id: 1,
    topic: 'Core Java',
    question: 'Which collection class allows null elements and maintains insertion order?',
    options: ['TreeSet', 'LinkedHashSet', 'HashSet', 'PriorityQueue'],
    correct: 1
  },
  {
    id: 2,
    topic: 'Data Structures',
    question: 'What is the average time complexity of searching in a balanced BST?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
    correct: 2
  },
  {
    id: 3,
    topic: 'Spring Framework',
    question: 'Which annotation is used to auto-wire beans by type in Spring Boot?',
    options: ['@Injectable', '@Autowired', '@Resource', '@Bean'],
    correct: 1
  },
  {
    id: 4,
    topic: 'Database & SQL',
    question: 'Which isolation level prevents Dirty Reads and Non-Repeatable Reads?',
    options: ['Read Uncommitted', 'Read Committed', 'Repeatable Read', 'Serializable'],
    correct: 2
  }
]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, token, setUser } = useAuthStore()
  const [submitError, setSubmitError] = useState('')

  const [step, setStep] = useState(1)
  const incomingRole = searchParams.get('role') === 'Full Stack Developer'
    ? 'fullstack'
    : searchParams.get('role') === 'Data Engineer'
      ? 'dsa_core'
      : searchParams.get('role') === 'DevOps Engineer'
        ? 'cloud_dev'
        : 'backend'
  const [selectedRole, setSelectedRole] = useState(incomingRole)
  const [dailyHours, setDailyHours] = useState(
    searchParams.get('hours') ? `${searchParams.get('hours')} hours/week` : '2'
  )
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSelectAnswer = (qIndex, optionIndex) => {
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: optionIndex }))
  }

  const handleNextQ = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1)
    } else {
      setStep(3)
    }
  }

  const calculateResults = () => {
    const scores = [
      { name: 'Core Java', score: selectedAnswers[0] === 1 ? 85 : 45 },
      { name: 'DSA', score: selectedAnswers[1] === 2 ? 90 : 40 },
      { name: 'Spring Boot', score: selectedAnswers[2] === 1 ? 80 : 35 },
      { name: 'SQL & DB', score: selectedAnswers[3] === 2 ? 85 : 50 }
    ]
    return scores
  }

  const handleFinishOnboarding = async () => {
    setIsGenerating(true)
    setSubmitError('')
    if (token?.startsWith('demo-')) {
      setIsGenerating(false)
      navigate('/home')
      return
    }
    try {
      await assessmentAPI.submitDiagnostic({
        role: selectedRole,
        dailyHours,
        answers: selectedAnswers,
      })
      await roadmapAPI.generate({
        targetRole: selectedRole,
        studyTimeHoursPerWeek: Number.parseInt(dailyHours, 10) || 5,
      })
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message || 'Unable to save onboarding results.')
      setIsGenerating(false)
      return
    } finally {
      setIsGenerating(false)
      navigate('/home')
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary p-6 md:p-12 flex flex-col justify-center items-center">
      <div className="w-full max-w-3xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs uppercase font-bold tracking-wider text-ai-400 flex items-center gap-1.5">
              <Sparkles size={14} /> AI Diagnostic & Path Generator
            </span>
            <span className="text-xs text-text-tertiary">Step {step} of 4</span>
          </div>
          <div className="w-full h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-brand-gradient"
              initial={{ width: '25%' }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Select Role & Time */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="card-glass p-8"
            >
              <h2 className="text-2xl font-bold mb-2">Choose Your Placement Goal</h2>
              <p className="text-sm text-text-secondary mb-6">
                Our AI customizes your daily problem of the day, curriculum, and interview simulations based on your target role.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {roles.map(r => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedRole === r.id
                        ? 'border-brand-500 bg-brand-500/10 shadow-glow-brand'
                        : 'border-border-subtle bg-bg-tertiary hover:border-border-default'
                    }`}
                  >
                    <div className="text-2xl mb-2">{r.icon}</div>
                    <h3 className="font-semibold text-text-primary mb-1">{r.name}</h3>
                    <p className="text-xs text-text-tertiary">{r.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mb-8">
                <label className="label mb-2">Daily Study Commitment</label>
                <div className="grid grid-cols-3 gap-3">
                  {['1-2 Hours', '2-4 Hours', '4+ Hours'].map((t, idx) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setDailyHours(t)}
                      className={`py-2.5 px-4 text-xs font-semibold rounded-lg border transition-all ${
                        dailyHours === t
                          ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                          : 'border-border-subtle bg-bg-tertiary text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="btn-primary btn-md flex items-center gap-2"
                >
                  Start Diagnostic Test <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Diagnostic Assessment */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="card-glass p-8"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="badge-ai text-2xs">{questions[currentQIndex].topic}</span>
                <span className="text-xs text-text-tertiary">
                  Question {currentQIndex + 1} of {questions.length}
                </span>
              </div>

              <h2 className="text-lg md:text-xl font-semibold mb-6">
                {questions[currentQIndex].question}
              </h2>

              <div className="space-y-3 mb-8">
                {questions[currentQIndex].options.map((opt, oIdx) => (
                  <div
                    key={opt}
                    onClick={() => handleSelectAnswer(currentQIndex, oIdx)}
                    className={`p-4 rounded-xl border cursor-pointer text-sm font-medium transition-all flex items-center justify-between ${
                      selectedAnswers[currentQIndex] === oIdx
                        ? 'border-brand-500 bg-brand-500/10 text-brand-300'
                        : 'border-border-subtle bg-bg-tertiary text-text-secondary hover:border-border-default hover:text-text-primary'
                    }`}
                  >
                    <span>{opt}</span>
                    {selectedAnswers[currentQIndex] === oIdx && <CheckCircle2 size={16} className="text-brand-400" />}
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQIndex === 0}
                  className="btn-secondary btn-sm"
                >
                  Previous
                </button>
                <button
                  onClick={handleNextQ}
                  disabled={selectedAnswers[currentQIndex] === undefined}
                  className="btn-primary btn-md flex items-center gap-2"
                >
                  {currentQIndex === questions.length - 1 ? 'Analyze Skill Gaps' : 'Next Question'}
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Skill Gap Analysis */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="card-glass p-8"
            >
              <div className="flex items-center gap-2 text-ai-400 mb-2 font-semibold text-sm">
                <Brain size={18} />
                AI Skill Gap Analysis Result
              </div>
              <h2 className="text-2xl font-bold mb-2">Diagnostic Score Breakdown</h2>
              <p className="text-sm text-text-secondary mb-6">
                We evaluated your responses against standard Java placement benchmarks.
              </p>

              <div className="h-48 w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={calculateResults()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#555D6E" fontSize={12} />
                    <YAxis stroke="#555D6E" fontSize={12} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0D1117', borderColor: 'rgba(255,255,255,0.1)' }}
                      labelStyle={{ color: '#F1F3F9' }}
                    />
                    <Bar dataKey="score" fill="#6248FF" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="alert-ai mb-6">
                <div>
                  <h4 className="font-semibold text-sm text-brand-300 mb-1">Identified Focus Areas:</h4>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Prioritizing <strong>Data Structures (BST & Arrays)</strong> and <strong>Spring Transaction Management</strong> to increase placement readiness from 45% to target 85%.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setStep(4)}
                  className="btn-primary btn-md flex items-center gap-2"
                >
                  Generate My Learning Roadmap <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Ready & Start */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="card-glass p-8 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-brand-gradient mx-auto flex items-center justify-center shadow-glow-brand mb-6">
                <Target size={32} className="text-white" />
              </div>

              <h2 className="text-2xl font-bold mb-3">Your Roadmap is Ready!</h2>
              <p className="text-sm text-text-secondary max-w-md mx-auto mb-8">
                Your personalized day-by-day roadmap, daily problem recommendations, and placement readiness tracker have been configured.
              </p>

              {submitError && (
                <div className="auth-error mb-4" role="alert">
                  <AlertCircle size={16} /><span>{submitError}</span>
                </div>
              )}
              <button
                onClick={handleFinishOnboarding}
                disabled={isGenerating}
                className="btn-primary btn-lg inline-flex items-center gap-2 shadow-glow-brand"
              >
                {isGenerating ? 'Configuring Your Workspace...' : 'Enter Dashboard'}
                <ArrowRight size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
