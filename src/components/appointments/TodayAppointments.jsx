// src/components/appointments/TodayAppointments.jsx
import { useState, useEffect } from 'react'
import { CalendarDays } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { appointmentsAPI } from '../../api'

function SkeletonRow() {
  return (
    <div style={{ display: 'flex', gap: 10, padding: '12px 0', borderBottom: '1px solid var(--slate-100)', alignItems: 'center' }}>
      <div className="apt-skeleton" style={{ width: 52, height: 36, flexShrink: 0, borderRadius: 8 }} />
      <div style={{ flex: 1 }}>
        <div className="apt-skeleton" style={{ height: 13, width: '60%', marginBottom: 6 }} />
        <div className="apt-skeleton" style={{ height: 11, width: '40%' }} />
      </div>
      <div className="apt-skeleton" style={{ width: 52, height: 22, borderRadius: 99 }} />
    </div>
  )
}

export default function TodayAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)

  useEffect(() => {
    appointmentsAPI.getToday()
      .then(res => setAppointments(Array.isArray(res) ? res : res?.data || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const todayStr = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '18px 24px',
        background: 'linear-gradient(135deg, var(--clinic-teal), var(--clinic-teal-2))',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: 'rgba(255,255,255,.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CalendarDays size={20} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>مواعيد اليوم</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.8)', marginTop: 2 }}>{todayStr}</div>
        </div>
        {!loading && (
          <div style={{
            background: 'rgba(255,255,255,.2)', borderRadius: 99,
            padding: '3px 12px', fontSize: 13, fontWeight: 700, color: '#fff',
          }}>
            {appointments.length} موعد
          </div>
        )}
      </div>

      {/* List */}
      <div style={{ padding: '8px 24px 16px' }}>
        {loading && Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}

        {!loading && error && (
          <p style={{ textAlign: 'center', color: 'var(--rose-500)', padding: '24px 0', fontSize: 13 }}>
            ⚠ {error}
          </p>
        )}

        {!loading && !error && appointments.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '28px 0', fontSize: 13 }}>
            لا توجد مواعيد اليوم
          </p>
        )}

        {!loading && !error && appointments.map((apt, i) => {
          const patientName = apt.patientId?.fullName || apt.patientId?.name || apt.patientName || '—'
          const doctorName  = apt.doctorId?.fullName  || apt.doctorId?.name  || apt.doctorName  || '—'
          const isLast = i === appointments.length - 1
          return (
            <div
              key={apt._id || i}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 0',
                borderBottom: isLast ? 'none' : '1px solid var(--slate-100)',
              }}
            >
              <div style={{
                minWidth: 52, textAlign: 'center', flexShrink: 0,
                background: 'var(--primary-50)', borderRadius: 'var(--radius-sm)', padding: '6px 4px',
              }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary-700)', lineHeight: 1.2 }}>
                  {apt.startTime || '—'}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 700, fontSize: 13, color: 'var(--text-main)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {patientName}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {doctorName}
                </div>
              </div>
              <StatusBadge status={apt.status} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
