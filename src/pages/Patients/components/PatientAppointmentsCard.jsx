import { useEffect, useState } from 'react'
import { CalendarClock, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { AR } from '../../../utils/ar'
import { patientService } from '../services/patientService'
const STATUS_LABEL = {
  scheduled: 'مجدول',
  completed: 'مكتمل',
  cancelled: 'ملغي',
  'no-show': 'لم يحضر',
}

export default function PatientAppointmentsCard({ patientId, refreshKey = 0, onReschedule }) {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    let alive = true
    if (!patientId) return
    setLoading(true)
    patientService.getAppointments(patientId)
      .then(list => {
        if (!alive) return
        const sorted = [...list].sort((a, b) => new Date(b.date || b.appointmentDate) - new Date(a.date || a.appointmentDate))
        setAppointments(sorted)
      })
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [patientId, refreshKey])

  const visible = expanded ? appointments : appointments.slice(0, 3)
  console.log({appointments})

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <CalendarClock size={14} /> {AR.appointmentsCard}
        </div>
        {appointments.length > 3 && (
          <button
            className="btn btn-ghost"
            style={{ padding: '4px 10px', fontSize: 12 }}
            onClick={() => setExpanded(v => !v)}
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />} {AR.viewAllAppointments}
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-center" style={{ padding: 12 }}><div className="spinner" /></div>
      ) : appointments.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>{AR.noAppointments}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {visible.map((a, i) => (
            <div key={a._id || a.id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  {(a.date || a.appointmentDate) ? new Date(a.date || a.appointmentDate).toLocaleDateString('ar-EG') : '—'}
                  {a.time ? ` · ${a.time}` : ''}
                </div>
                {a.notes && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{a.notes}</div>}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  className={`badge ${a.status === 'completed'
                    ? 'badge-green'
                    : a.status === 'cancelled'
                      ? 'badge-red'
                      : a.status === 'no-show'
                        ? 'badge-amber'
                        : 'badge-blue'
                    }`}
                >
                  {STATUS_LABEL[a.status] || a.status || '—'}
                </span>

                {a.status === 'scheduled' && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: 11 }}

                    onClick={() => onReschedule?.(a)}
                  >
                    <RefreshCw size={12} /> إعادة جدولة
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
