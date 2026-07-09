// src/components/appointments/PatientAppointments.jsx
import { useState, useEffect } from 'react'
import { CalendarDays } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { appointmentsAPI } from '../../api'

function SkeletonCard() {
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
      <div className="apt-skeleton" style={{ width: 54, height: 54, borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="apt-skeleton" style={{ height: 14, width: '55%', marginBottom: 8 }} />
        <div className="apt-skeleton" style={{ height: 12, width: '40%' }} />
      </div>
      <div className="apt-skeleton" style={{ width: 58, height: 22, borderRadius: 99 }} />
    </div>
  )
}

export default function PatientAppointments({ patientId }) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)

  useEffect(() => {
    if (!patientId) return
    setLoading(true)
    setError(null)
    appointmentsAPI.getByPatient(patientId)
      .then(res => setAppointments(Array.isArray(res) ? res : res?.data || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [patientId])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--rose-500)', fontSize: 13 }}>
        ⚠ {error}
      </div>
    )
  }

  if (appointments.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
        <CalendarDays size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: .35 }} />
        <p style={{ fontSize: 13 }}>لا توجد مواعيد لهذا المريض</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {appointments.map((apt, i) => {
        const doctorName = apt.doctorId?.fullName || apt.doctorId?.name || apt.doctorName || '—'
        const d          = apt.date ? new Date(apt.date) : null
        const dateStr    = d
          ? d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
          : '—'
        return (
          <div key={apt._id || i} className="patient-apt-card">
            {/* Date block */}
            <div style={{
              minWidth: 54, textAlign: 'center', flexShrink: 0,
              background: 'var(--primary-50)', borderRadius: 10, padding: '8px 6px',
            }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--primary-700)', lineHeight: 1 }}>
                {d ? d.getDate() : '—'}
              </div>
              <div style={{ fontSize: 10, color: 'var(--primary-500)', marginTop: 2 }}>
                {d ? d.toLocaleDateString('ar-EG', { month: 'short' }) : ''}
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main)' }}>
                {doctorName}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {dateStr}{apt.startTime ? ` — ${apt.startTime}` : ''}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
              <StatusBadge status={apt.status} />
              {apt.totalCost !== undefined && (
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--clinic-teal)' }}>
                  {Number(apt.totalCost).toLocaleString('ar-EG')} ج.م
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
