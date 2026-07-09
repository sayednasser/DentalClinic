// src/components/appointments/AppointmentRow.jsx
import { useState, useCallback } from 'react'
import { CalendarClock } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { appointmentsAPI } from '../../api'

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'مجدول' },
  { value: 'completed', label: 'مكتمل' },
  { value: 'cancelled', label: 'ملغي' },
  { value: 'no-show', label: 'لم يحضر' },
]

export default function AppointmentRow({ appointment, onReschedule, onStatusChange, toast }) {
  const [status, setStatus] = useState(appointment.status)
  const [updating, setUpdating] = useState(false)

  const patientName = appointment.patientId?.fullName || appointment.patientId?.name || appointment.patientName || '—'
  const phone = appointment.patientId?.phone || '—'
  const doctorName = appointment.doctorId?.fullName || appointment.doctorId?.name || appointment.doctorName || '—'
  const specialty = appointment.doctorId?.specialty || '—'
  const dateStr = appointment.date
    ? new Date(appointment.date).toLocaleDateString('ar-EG')
    : '—'

  const handleStatus = useCallback(async (newStatus) => {
    const prev = status
    setStatus(newStatus)
    setUpdating(true)
    try {
      await appointmentsAPI.updateStatus(appointment._id, newStatus)
      toast?.('success', 'تم تحديث الحالة')
      onStatusChange?.()
    } catch (err) {
      setStatus(prev)
      toast?.('error', err.message || 'فشل تحديث الحالة')
    } finally {
      setUpdating(false)
    }
  }, [appointment._id, status, toast, onStatusChange])

  return (
    <tr>
      {/* المريض */}
      <td>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main)' }}>{patientName}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{phone}</div>
      </td>

      {/* الطبيب */}
      <td>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{doctorName}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{specialty}</div>
      </td>

      {/* التاريخ */}
      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{dateStr}</td>

      {/* الوقت */}
      <td>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{appointment.startTime || '—'}</div>
        {appointment.endTime && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{appointment.endTime}</div>
        )}
      </td>

      {/* الحالة */}
      <td><StatusBadge status={status} /></td>

      {/* التكلفة */}
      <td>
        <span style={{ fontWeight: 700, color: 'var(--clinic-teal)' }}>
          {Number(appointment.totalCost || 0).toLocaleString('ar-EG')} ج.م
        </span>
      </td>

      {/* الإجراءات */}
      <td>
        <div className="apt-actions-cell" style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="input-field"
            value={status}
            onChange={e => handleStatus(e.target.value)}
            disabled={updating}
            style={{ fontSize: 12, padding: '6px 10px', minWidth: 108, flex: 1 }}
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            className="btn btn-ghost"
            onClick={() => {

              onReschedule(appointment)
            }}

            style={{ padding: '6px 10px', fontSize: 12, gap: 4, whiteSpace: 'nowrap' }}
            type="button"
          >
            <CalendarClock size={14} />
            إعادة جدولة
          </button>
        </div>
      </td>
    </tr>
  )
}
