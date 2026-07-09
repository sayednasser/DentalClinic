// src/components/appointments/RescheduleModal.jsx
import { useState, useEffect, useCallback, useMemo } from 'react'
import { X, Clock } from 'lucide-react'
import { appointmentsAPI } from '../../api'
import AvailableSlots from './AvailableSlots'

export default function RescheduleModal({ appointment, onClose, onSuccess, toast }) {

  const [date, setDate] = useState('')
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const today = useMemo(() => new Date().toISOString().split('T')[0], [])
  const doctorId = appointment.doctorId?._id || appointment.doctorId
  const doctorName = appointment.doctorId?.fullName || appointment.doctorId?.name || appointment.doctorName || '—'
  const patientName = appointment.patientId?.fullName || appointment.patientId?.name || appointment.patientName || '—'
  console.log("appointment =", appointment);
  console.log("appointment.doctorId =", appointment.doctorId);
  console.log("doctorId =", doctorId);
  const fetchSlots = useCallback(async () => {
    if (!date) return
    setSlotsLoading(true)
    setSlots([])
    setSelectedSlot(null)
    try {
      const res = await appointmentsAPI.getAvailableSlots(doctorId, date)
      setSlots(Array.isArray(res) ? res : res?.data || [])
    } catch (err) {
      toast?.('error', err.message || 'فشل تحميل الأوقات')
    } finally {
      setSlotsLoading(false)
    }
  }, [date, doctorId, toast])

  useEffect(() => { if (date) fetchSlots() }, [date])

  const handleReschedule = useCallback(async () => {
    if (!selectedSlot) { toast?.('error', 'اختر الوقت الجديد'); return }
    setSaving(true)
    try {
      await appointmentsAPI.reschedule(appointment._id, {
        date,
        startTime: selectedSlot.startTime,
      })
      toast?.('success', 'تم إعادة الجدولة بنجاح')
      onSuccess()
    } catch (err) {
      toast?.('error', err.message || 'فشل إعادة الجدولة')
    } finally {
      setSaving(false)
    }
  }, [appointment._id, date, selectedSlot, toast, onSuccess])

  const currentDate = appointment.date
    ? new Date(appointment.date).toLocaleDateString('ar-EG')
    : '—'

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 460 }}>

        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800 }}>إعادة جدولة الموعد</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
              {patientName} — {doctorName}
            </p>
          </div>
          <button className="icon-btn" onClick={onClose} type="button"><X size={18} /></button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Current appointment */}
          <div style={{
            background: 'var(--slate-50)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 13,
          }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: 4, fontSize: 11 }}>الموعد الحالي</div>
            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
              <Clock size={13} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
              {currentDate} — {appointment.startTime || '—'}
            </div>
          </div>

          {/* New date */}
          <div className="input-group">
            <label>التاريخ الجديد</label>
            <input
              type="date" className="input-field"
              value={date} min={today}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          {/* Slots */}
          {date && (
            <div className="input-group">
              <label>الأوقات المتاحة</label>
              <AvailableSlots
                slots={slots} selectedSlot={selectedSlot}
                onSelect={setSelectedSlot} loading={slotsLoading}
              />
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} type="button">إلغاء</button>
          <button
            className="btn btn-primary" type="button"
            onClick={handleReschedule}
            disabled={saving || !selectedSlot}
          >
            {saving ? 'جارٍ الحفظ...' : 'تأكيد إعادة الجدولة'}
          </button>
        </div>
      </div>
    </div>
  )
}
