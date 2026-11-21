import React, { useEffect, useState } from 'react'
import { Users, Award, TrendingUp, CheckCircle2 } from 'lucide-react'
import { trainerAPI } from '../../lib/api'

export default function StudentProgress() {
  const [students, setStudents] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    trainerAPI.getStudents()
      .then(async ({ data }) => {
        const ids = Array.isArray(data) ? data : []
        const details = await Promise.all(ids.map(async (student) => {
          try {
            const { data: progress } = await trainerAPI.getStudent(student.id)
            return {
              name: progress.name || `Student ${student.id}`,
              role: progress.targetRole || 'Not set',
              readiness: `${progress.readiness ?? 0}%`,
              weakArea: student.weakArea || 'Insufficient evidence',
              status: progress.status || student.status || 'Needs Support',
            }
          } catch {
            return {
              name: `Student ${student.id}`,
              role: 'Not set',
              readiness: `${student.readiness ?? 0}%`,
              weakArea: student.weakArea || 'Insufficient evidence',
              status: student.status || 'Needs Support',
            }
          }
        }))
        setStudents(details)
      })
      .catch((err) => setError(err.response?.data?.message || err.message || 'Unable to load student progress'))
  }, [])

  return (
    <div className="page-container py-8">
      <h1 className="text-2xl font-bold mb-2">Enrolled Student Cohort Progress</h1>
      <p className="text-sm text-text-secondary mb-6">Real-time skill gap analysis, diagnostic results, and placement readiness</p>
      {error && <div className="auth-error mb-6" role="alert">{error}</div>}

      <div className="card-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-bg-tertiary text-text-tertiary text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Target Track</th>
                <th className="py-3 px-4">Readiness Score</th>
                <th className="py-3 px-4">Detected Weak Area</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {students.map((s, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-medium text-text-primary">{s.name}</td>
                  <td className="py-3 px-4 text-text-secondary">{s.role}</td>
                  <td className="py-3 px-4 font-semibold text-brand-300">{s.readiness}</td>
                  <td className="py-3 px-4 text-warning text-xs">{s.weakArea}</td>
                  <td className="py-3 px-4">
                    <span className="badge badge-brand text-2xs">{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
