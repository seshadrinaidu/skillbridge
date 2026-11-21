import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Users, Award, PlusCircle, CheckCircle, TrendingUp } from 'lucide-react'
import { trainerAPI } from '../../lib/api'

export default function TrainerDashboard() {
  const [stats, setStats] = useState({ activeCourses: 0, enrolledStudents: 0, averagePlacementReadiness: 0 })
  const [error, setError] = useState(null)

  useEffect(() => {
    trainerAPI.getDashboard?.()
      .then(({ data }) => setStats(data))
      .catch((err) => setError(err.response?.data?.message || err.message || 'Unable to load trainer dashboard'))
  }, [])

  return (
    <div className="page-container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Trainer Command Center</h1>
          <p className="text-sm text-text-secondary">Manage curriculum, assessments, and track enrolled student skill gaps</p>
        </div>
        <div className="flex gap-3">
          <Link to="/trainer/courses" className="btn-primary btn-sm flex items-center gap-2">
            <PlusCircle size={16} /> Create Course
          </Link>
        </div>
      </div>

      {error && <div className="auth-error mb-6" role="alert">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="card-glass p-5">
          <div className="flex items-center gap-3 text-brand-400 mb-2">
            <BookOpen size={20} />
            <span className="text-xs font-semibold uppercase text-text-tertiary">Active Courses</span>
          </div>
          <div className="text-3xl font-bold">{stats.activeCourses ?? 0}</div>
        </div>
        <div className="card-glass p-5">
          <div className="flex items-center gap-3 text-ai-400 mb-2">
            <Users size={20} />
            <span className="text-xs font-semibold uppercase text-text-tertiary">Enrolled Students</span>
          </div>
          <div className="text-3xl font-bold">{stats.enrolledStudents ?? 0}</div>
        </div>
        <div className="card-glass p-5">
          <div className="flex items-center gap-3 text-success mb-2">
            <TrendingUp size={20} />
            <span className="text-xs font-semibold uppercase text-text-tertiary">Avg. Placement Readiness</span>
          </div>
          <div className="text-3xl font-bold">{stats.averagePlacementReadiness ?? 0}%</div>
        </div>
      </div>

      <div className="card-glass p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Navigation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/trainer/courses" className="p-4 rounded-xl border border-border-subtle hover:border-brand-500 bg-bg-tertiary transition-colors flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm">Course & Lesson Manager</h3>
              <p className="text-xs text-text-secondary mt-1">Publish lessons, modify assignments, and configure diagnostic tests</p>
            </div>
            <BookOpen size={20} className="text-text-tertiary" />
          </Link>
          <Link to="/trainer/students" className="p-4 rounded-xl border border-border-subtle hover:border-brand-500 bg-bg-tertiary transition-colors flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm">Student Performance & Gap Tracker</h3>
              <p className="text-xs text-text-secondary mt-1">Inspect individual student mock interview recordings and weak areas</p>
            </div>
            <Users size={20} className="text-text-tertiary" />
          </Link>
        </div>
      </div>
    </div>
  )
}
