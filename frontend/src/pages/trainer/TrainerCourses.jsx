import React, { useEffect, useState } from 'react'
import { Plus, BookOpen, Clock, Users, ArrowUpRight } from 'lucide-react'
import { courseAPI, trainerAPI } from '../../lib/api'

export default function TrainerCourses() {
  const [courses, setCourses] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    trainerAPI.getCourses()
      .then(({ data }) => setCourses(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.response?.data?.message || err.message || 'Unable to load courses'))
  }, [])

  return (
    <div className="page-container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Course Management</h1>
          <p className="text-sm text-text-secondary">Organize syllabus, quizzes, and output prediction tasks</p>
        </div>
        <button className="btn-primary btn-sm flex items-center gap-1.5">
          <Plus size={16} /> New Course
        </button>
      </div>

      {error && <div className="auth-error mb-6" role="alert">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {courses.map(c => (
          <div key={c.id} className="card-glass p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className={`badge ${c.published ? 'badge-success' : 'badge-warning'}`}>
                  {c.published ? 'Published' : 'Draft'}
                </span>
                <span className="text-xs text-text-tertiary flex items-center gap-1">
                  <Users size={12} /> {c.students ?? 0} students
                </span>
              </div>
              <h3 className="font-semibold text-base mb-2">{c.title}</h3>
              <p className="text-xs text-text-secondary mb-4">Trainer-managed course</p>
            </div>
            <div className="pt-4 border-t border-border-subtle flex justify-between items-center">
              <span className="text-xs text-brand-400">Manage Curriculum</span>
              <ArrowUpRight size={16} className="text-brand-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
