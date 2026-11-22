import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, Save, Plus, ArrowLeft } from 'lucide-react'
import { courseAPI, trainerAPI } from '../../lib/api'

export default function CourseEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'BEGINNER',
    published: false,
  })
  const [lessons, setLessons] = useState([])
  const [lessonForm, setLessonForm] = useState({ title: '', content: '', position: 0, published: true })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id || id === 'new') return
    Promise.all([courseAPI.get(id), courseAPI.getLessons(id)])
      .then(([courseResult, lessonsResult]) => {
        setCourse(courseResult.data)
        setLessons(Array.isArray(lessonsResult.data) ? lessonsResult.data : [])
      })
      .catch(err => setError(err.response?.data?.message || err.message || 'Unable to load the course'))
  }, [id])

  const saveCourse = async event => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        title: course.title,
        description: course.description,
        category: course.category,
        difficulty: course.difficulty,
        published: Boolean(course.published),
      }
      const result = id && id !== 'new'
        ? await courseAPI.update(id, payload)
        : await courseAPI.create(payload)
      setCourse(result.data)
      if (!id || id === 'new') navigate(`/trainer/courses/${result.data.id}`, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to save the course')
    } finally {
      setSaving(false)
    }
  }

  const addLesson = async event => {
    event.preventDefault()
    if (!id || id === 'new') {
      setError('Save the course before adding lessons')
      return
    }
    setError('')
    try {
      const { data } = await courseAPI.createLesson(id, lessonForm)
      setLessons(previous => [...previous, data].sort((a, b) => a.position - b.position))
      setLessonForm({ title: '', content: '', position: lessons.length + 1, published: true })
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to add the lesson')
    }
  }

  const togglePublished = async () => {
    if (!id || id === 'new') return
    try {
      const action = course.published
        ? trainerAPI.unpublishCourse(id)
        : trainerAPI.publishCourse(id)
      const { data } = await action
      setCourse(previous => ({ ...previous, published: data.published }))
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to change publish state')
    }
  }

  return (
    <div className="page-container py-8">
      <button className="btn-ghost btn-sm mb-5" onClick={() => navigate('/trainer/courses')}>
        <ArrowLeft size={15} /> Back to courses
      </button>
      <h1 className="text-2xl font-bold mb-2">Course & Lesson Editor</h1>
      <p className="text-sm text-text-secondary mb-6">Manage persistent course metadata and lesson content.</p>

      {error && (
        <div className="auth-error mb-5" role="alert"><AlertCircle size={16} /><span>{error}</span></div>
      )}

      <form className="card-glass p-6 space-y-4 mb-6" onSubmit={saveCourse}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="auth-field">
            <span>Title</span>
            <input value={course.title} onChange={e => setCourse({ ...course, title: e.target.value })} required />
          </label>
          <label className="auth-field">
            <span>Category</span>
            <input value={course.category || ''} onChange={e => setCourse({ ...course, category: e.target.value })} />
          </label>
        </div>
        <label className="auth-field">
          <span>Description</span>
          <textarea value={course.description || ''} onChange={e => setCourse({ ...course, description: e.target.value })} rows={4} />
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="auth-field">
            <span>Difficulty</span>
            <select value={course.difficulty || 'BEGINNER'} onChange={e => setCourse({ ...course, difficulty: e.target.value })}>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary btn-md" disabled={saving}><Save size={16} /> Save course</button>
          {id && id !== 'new' && (
            <button type="button" className="btn-secondary btn-md" onClick={togglePublished}>
              {course.published ? 'Unpublish' : 'Publish'}
            </button>
          )}
        </div>
      </form>

      {id && id !== 'new' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form className="card-glass p-5 space-y-4" onSubmit={addLesson}>
            <h2 className="text-lg font-semibold">Add Lesson</h2>
            <label className="auth-field">
              <span>Title</span>
              <input value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} required />
            </label>
            <label className="auth-field">
              <span>Position</span>
              <input type="number" min="0" value={lessonForm.position} onChange={e => setLessonForm({ ...lessonForm, position: Number(e.target.value) })} />
            </label>
            <label className="auth-field">
              <span>Content</span>
              <textarea value={lessonForm.content} onChange={e => setLessonForm({ ...lessonForm, content: e.target.value })} rows={6} />
            </label>
            <button className="btn-primary btn-md"><Plus size={16} /> Add lesson</button>
          </form>

          <div className="card-glass p-5">
            <h2 className="text-lg font-semibold mb-4">Lessons</h2>
            {lessons.length === 0 ? (
              <p className="text-sm text-text-secondary">No lessons yet.</p>
            ) : (
              <div className="space-y-2">
                {lessons.map(lesson => (
                  <div key={lesson.id} className="p-3 rounded-lg border border-border-subtle">
                    <p className="font-medium text-sm">{lesson.position}. {lesson.title}</p>
                    <p className="text-xs text-text-tertiary">{lesson.published ? 'Published' : 'Draft'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
