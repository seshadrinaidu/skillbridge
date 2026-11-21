import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useScroll, useSpring, useReducedMotion, useTransform } from 'framer-motion'
import {
  ArrowRight, Check, ChevronRight, Menu, X, Sparkles, Code2,
  Map, Target, CircleGauge, BookOpen, BriefcaseBusiness
} from 'lucide-react'

const roleOptions = [
  'Java Backend Developer',
  'Full Stack Developer',
  'Data Engineer',
  'DevOps Engineer',
]

const roadmapItems = [
  { n: '01', title: 'Java diagnostic', meta: '25 min', state: 'Start', accent: true },
  { n: '02', title: 'Collections practice', meta: '2 tasks', state: 'Next' },
  { n: '03', title: 'Mini-project milestone', meta: 'Build + review', state: 'Later' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const scrollProgress = useSpring(scrollYProgress, { stiffness: 180, damping: 28, restDelta: 0.001 })
  const heroY = useTransform(scrollYProgress, [0, 0.22], [0, reduceMotion ? 0 : 54])
  const heroScale = useTransform(scrollYProgress, [0, 0.18], [1, reduceMotion ? 1 : 0.96])
  const [role, setRole] = useState(roleOptions[0])
  const [hours, setHours] = useState('5')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [solutionsOpen, setSolutionsOpen] = useState(false)
  const [hint, setHint] = useState(0)

  const startRoadmap = () => {
    navigate(`/register?role=${encodeURIComponent(role)}&hours=${encodeURIComponent(hours)}`)
  }

  const handleHeroMove = (event) => {
    if (reduceMotion) return
    const rect = event.currentTarget.getBoundingRect?.() || event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--spot-x', `${event.clientX - rect.left}px`)
    event.currentTarget.style.setProperty('--spot-y', `${event.clientY - rect.top}px`)
  }

  const hints = [
    'What does the method need to remember while it moves through the array?',
    'A HashMap can check for the matching value in constant expected time.',
    'Edge case: if nums[i] == target - nums[i], do not reuse the same index.',
  ]

  return (
    <div className="landing">
      <motion.div className="landing-scroll-progress" style={{ scaleX: scrollProgress }} aria-hidden="true" />
      <header className="landing-header">
        <div className="landing-shell header-inner">
          <Link className="wordmark" to="/" aria-label="SkillBridge home">
            <span className="wordmark-mark"><Sparkles size={14} /></span>
            <span>SkillBridge</span>
          </Link>

          <nav className="desktop-nav" aria-label="Primary navigation">
            <a href="#how">How It Works</a>
            <div className="nav-popup-wrap">
              <button
                type="button"
                aria-expanded={solutionsOpen}
                onClick={() => setSolutionsOpen(value => !value)}
                onBlur={(event) => {
                  if (!event.currentTarget.parentElement?.contains(event.relatedTarget)) setSolutionsOpen(false)
                }}
              >
                Solutions <ChevronRight size={13} />
              </button>
              <AnimatePresence>
                {solutionsOpen && (
                  <motion.div
                    className="nav-popup"
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                  >
                    {[
                      ['01', 'AI Roadmap', 'Personal route for your target role'],
                      ['02', 'Daily DSA', 'Practice selected from weak areas'],
                      ['03', 'AI Mentor', 'Progressive hints and evidence'],
                    ].map(([number, title, copy]) => (
                      <a href={title === 'AI Mentor' ? '#practice' : title === 'Daily DSA' ? '#how' : '#roadmap-preview'} key={title} onClick={() => setSolutionsOpen(false)}>
                        <span>{number}</span>
                        <div><strong>{title}</strong><small>{copy}</small></div>
                        <ArrowRight size={15} />
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <a href="#placement">Placement</a>
          </nav>

          <div className="header-actions">
            <Link className="signin" to="/login">Sign In</Link>
            <button className="button button-primary header-cta" onClick={startRoadmap}>
              Start My Roadmap <ArrowRight size={16} />
            </button>
            <button
              className="mobile-menu"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
              onClick={() => setMobileOpen(v => !v)}
            >
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              className="mobile-nav"
              aria-label="Mobile navigation"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.22 }}
            >
              <a href="#how" onClick={() => setMobileOpen(false)}>How It Works <ArrowRight size={15} /></a>
              <a href="#practice" onClick={() => setMobileOpen(false)}>Practice <ArrowRight size={15} /></a>
              <a href="#placement" onClick={() => setMobileOpen(false)}>Placement <ArrowRight size={15} /></a>
              <Link to="/login" onClick={() => setMobileOpen(false)}>Sign In <ArrowRight size={15} /></Link>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main>
        <section className="hero" onMouseMove={handleHeroMove}>
          <div className="hero-grid-pattern" aria-hidden="true" />
          <div className="hero-cursor-light" aria-hidden="true" />
          <div className="hero-particles" aria-hidden="true">
            {[0,1,2,3,4,5].map(index => <span key={index} />)}
          </div>
          <div className="hero-orb hero-orb-one" aria-hidden="true" />
          <div className="hero-orb hero-orb-two" aria-hidden="true" />
          <motion.div className="landing-shell hero-grid" style={{ y: heroY, scale: heroScale }}>
            <motion.div
              className="hero-copy"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
            >
              <p className="eyebrow"><span /> AI learning, made personal</p>
              <h1>Know what<br />to learn next.</h1>
              <p className="hero-lede">
                Take a skill check, get a roadmap for your target role, and practice with an AI mentor that uses your past attempts to help you improve.
              </p>
              <div className="hero-actions">
                <button className="button button-primary button-large" onClick={startRoadmap}>
                  Start My Roadmap <ArrowRight size={18} />
                </button>
                <a className="button button-secondary button-large" href="#roadmap-preview">
                  See a Sample Plan
                </a>
              </div>
            </motion.div>

            <motion.div
              id="roadmap-preview"
              className="roadmap-preview"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.12 }}
              aria-label="Interactive sample roadmap"
            >
              <div className="preview-topbar">
                <span className="preview-label"><span className="live-dot" /> Sample roadmap</span>
                <span className="preview-week">WEEK 01</span>
              </div>

              <div className="preview-controls">
                <label>
                  <span>Target role</span>
                  <select value={role} onChange={e => setRole(e.target.value)}>
                    {roleOptions.map(option => <option key={option}>{option}</option>)}
                  </select>
                </label>
                <label>
                  <span>Study time</span>
                  <select value={hours} onChange={e => setHours(e.target.value)}>
                    <option value="3">3 hours / week</option>
                    <option value="5">5 hours / week</option>
                    <option value="8">8 hours / week</option>
                    <option value="10">10 hours / week</option>
                  </select>
                </label>
              </div>

              <div className="preview-plan">
                <div className="plan-heading">
                  <div>
                    <span className="micro-label">Your 7-day route</span>
                    <h2>{role}</h2>
                  </div>
                  <div className="plan-score" aria-label="Preparation readiness 68 percent">
                    <CircleGauge size={18} />
                    <strong>68%</strong>
                  </div>
                </div>
                <div className="plan-items">
                  {roadmapItems.map((item, index) => (
                    <motion.div
                      className={`plan-item ${item.accent ? 'plan-item-active' : ''}`}
                      key={item.title}
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.18 }}
                    >
                      <span className="plan-number">{item.n}</span>
                      <div className="plan-copy">
                        <strong>{item.title}</strong>
                        <span>{item.meta}</span>
                      </div>
                      {item.accent ? <span className="plan-start">Start</span> : <ChevronRight size={17} />}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        <div className="feature-marquee" aria-label="Platform capabilities">
          <motion.div
            className="feature-marquee-track"
            animate={reduceMotion ? undefined : { x: ['0%', '-50%'] }}
            transition={reduceMotion ? undefined : { duration: 28, repeat: Infinity, ease: 'linear' }}
          >
            {[0, 1].map(copy => (
              <div className="feature-marquee-set" key={copy} aria-hidden={copy === 1}>
                {['Personal roadmaps', 'Daily DSA', 'AI mentor', 'Mock interviews', 'Skill-gap analysis', 'Project readiness'].map(feature => (
                  <span key={`${copy}-${feature}`}><Sparkles size={13} /> {feature}</span>
                ))}
              </div>
            ))}
          </motion.div>
        </div>

        <section className="how-section" id="how">
          <div className="landing-shell">
            <motion.div
              className="section-heading"
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.6 }}
            >
              <p className="eyebrow"><span /> The short route</p>
              <h2>From where you are<br />to where you want to go.</h2>
            </motion.div>
            <div className="steps-grid">
              {[
                { n: '01', title: 'Choose a role', text: 'Tell us the job you are building toward.', icon: BriefcaseBusiness, visual: 'role' },
                { n: '02', title: 'Take the diagnostic', text: 'Find the skill gaps that actually matter.', icon: Target, visual: 'score' },
                { n: '03', title: 'Practice today', text: 'Work one relevant problem at a time.', icon: Code2, visual: 'code' },
                { n: '04', title: 'Review progress', text: 'Turn every attempt into evidence.', icon: Map, visual: 'progress' },
              ].map((step, index) => (
                <motion.article
                  className="step-card"
                  key={step.n}
                  initial={reduceMotion ? false : { opacity: 0, y: 36 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.48, delay: index * 0.08 }}
                >
                  <div className={`step-preview step-preview-${step.visual}`}>
                    {step.visual === 'role' && <><span>Target role</span><strong>Java Backend</strong><Check size={16} /></>}
                    {step.visual === 'score' && <><div className="score-ring">72</div><div><strong>Core Java</strong><span>Strong</span></div></>}
                    {step.visual === 'code' && <><span>public int[] twoSum</span><b>{'<'} / {'>'}</b></>}
                    {step.visual === 'progress' && <><strong>+18%</strong><span>readiness this month</span><div className="mini-bars"><i /><i /><i /><i /></div></>}
                  </div>
                  <div className="step-meta"><span>{step.n}</span><step.icon size={17} /></div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="practice-section" id="practice">
          <div className="landing-shell practice-grid">
            <motion.div
              className="practice-copy"
              initial={reduceMotion ? false : { opacity: 0, x: -28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55 }}
            >
              <p className="eyebrow"><span /> Daily problem + mentor</p>
              <h2>Practice with context,<br />not guesswork.</h2>
              <p>
                This problem was assigned because your attempt history shows that you repeatedly miss edge cases in array problems.
              </p>
              <div className="problem-reason">
                <span>Because you struggled with</span>
                <strong>HashMap lookups · 2 attempts</strong>
              </div>
            </motion.div>

            <motion.div
              className="mentor-stage"
              initial={reduceMotion ? false : { opacity: 0, y: 38, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.62 }}
            >
              <div className="code-card">
                <div className="code-card-head">
                  <div><span className="red-dot" /><span className="yellow-dot" /><span className="green-dot" /></div>
                  <span>Solution.java</span>
                  <span className="failed-label">1 / 3 failed</span>
                </div>
                <pre><code>{`class Solution {
  public int[] twoSum(int[] nums, int target) {
    for (int i = 0; i < nums.length; i++) {
      for (int j = i + 1; j < nums.length; j++) {
        if (nums[i] + nums[j] == target)
          return new int[]{i, j};
      }
    }
    return new int[]{};
  }
}`}</code></pre>
                <div className="failed-case">
                  <X size={15} />
                  <div><strong>Case 3 failed</strong><span>Input: nums = [3,3], target = 6</span></div>
                </div>
              </div>

              <div className="mentor-card" aria-live="polite">
                <div className="mentor-head">
                  <div className="mentor-avatar"><Sparkles size={15} /></div>
                  <div><strong>AI mentor</strong><span>Progressive hint {hint + 1} of 3</span></div>
                </div>
                <motion.p key={hint} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                  {hints[hint]}
                </motion.p>
                <div className="hint-actions">
                  {[0, 1, 2].map(index => (
                    <button
                      key={index}
                      className={hint === index ? 'active' : ''}
                      onClick={() => setHint(index)}
                      aria-label={`Reveal hint ${index + 1}`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <span>Guiding question</span>
                </div>
              </div>
            </motion.div>

            <div className="feedback-example">
              <span className="micro-label">Sample feedback</span>
              <p><strong>Your previous attempt used nested loops.</strong> This solved correctness but missed the performance target. Try one HashMap pass, then review the [3,3] edge case.</p>
              <a href="/practice">Try the daily problem <ArrowRight size={15} /></a>
            </div>
          </div>
        </section>

        <section className="placement-section" id="placement">
          <div className="landing-shell">
            <motion.div
              className="placement-head"
              initial={reduceMotion ? false : { opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.58 }}
            >
              <div>
                <p className="eyebrow"><span /> Placement readiness</p>
                <h2>One clear picture.<br />One next move.</h2>
              </div>
              <p>Guided mocks, interview simulations, and mini-projects all feed your readiness score—with evidence behind every result.</p>
            </motion.div>

            <motion.div
              className="readiness-grid"
              initial={reduceMotion ? false : { opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.65, delay: 0.08 }}
            >
              <div className="readiness-main">
                <div className="readiness-score">
                  <div className="big-score">68<span>%</span></div>
                  <div><span>Placement readiness</span><strong>Almost interview-ready</strong></div>
                </div>
                <div className="readiness-bars">
                  {[
                    ['DSA', 74],
                    ['Core Java', 82],
                    ['System design', 58],
                    ['Communication', 61],
                  ].map(([label, score]) => (
                    <div className="readiness-row" key={label}>
                      <span>{label}</span>
                      <div><i style={{ width: `${score}%` }} /></div>
                      <strong>{score}%</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div className="next-action">
                <span className="micro-label">Recommended next action</span>
                <h3>Complete a 20-minute system design mock.</h3>
                <p>Based on 3 low-confidence answers and one project review.</p>
                <button className="button button-primary" onClick={startRoadmap}>Take the diagnostic <ArrowRight size={16} /></button>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="final-cta">
          <motion.div
            className="landing-shell"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.62 }}
          >
            <p className="eyebrow"><span /> Ready when you are</p>
            <h2>Find your next<br />right step.</h2>
            <button className="button button-primary button-large" onClick={startRoadmap}>
              Start My Roadmap <ArrowRight size={18} />
            </button>
          </motion.div>
        </section>
      </main>
      <footer className="landing-footer">
        <motion.div
          className="landing-shell landing-footer-grid"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
        >
          <div className="footer-brand">
            <Link className="wordmark" to="/" aria-label="SkillBridge home">
              <span className="wordmark-mark"><Sparkles size={14} /></span>
              <span>SkillBridge</span>
            </Link>
            <p>Learn from evidence. Practice with purpose. Get placement ready.</p>
            <a className="footer-email" href="mailto:hello@skillbridge.app">
              hello@skillbridge.app <ArrowRight size={14} />
            </a>
            <div className="footer-status">
              <span /> Platform preview available
            </div>
          </div>
          <div className="footer-links">
            <div>
              <span>Platform</span>
              <a href="#how">How it works</a>
              <a href="#roadmap-preview">Roadmap builder</a>
              <a href="#practice">AI mentor</a>
              <a href="#placement">Placement readiness</a>
            </div>
            <div>
              <span>Practice</span>
              <Link to="/practice">Daily problem</Link>
              <Link to="/learn">Learning lab</Link>
              <Link to="/interview">Mock interviews</Link>
              <Link to="/performance">Performance</Link>
            </div>
            <div>
              <span>Account</span>
              <Link to="/login">Sign in</Link>
              <Link to="/register">Create account</Link>
              <Link to="/courses">Browse courses</Link>
            </div>
            <div>
              <span>Legal & help</span>
              <a href="#privacy">Privacy</a>
              <a href="#terms">Terms</a>
              <a href="mailto:hello@skillbridge.app">Contact support</a>
              <a href="#accessibility">Accessibility</a>
            </div>
          </div>
        </motion.div>
        <div className="landing-shell footer-bottom">
          <span>© {new Date().getFullYear()} SkillBridge. All rights reserved.</span>
          <div className="footer-bottom-links">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#accessibility">Accessibility</a>
          </div>
          <span>Made for focused learning</span>
        </div>
      </footer>
    </div>
  )
}
