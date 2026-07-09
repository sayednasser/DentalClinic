import { useCallback, useMemo, useState } from 'react'
import { X, Clock } from 'lucide-react'
import { appointmentsAPI } from '../../../api'
import AvailableSlots from '../../../components/appointments/AvailableSlots'
import { useToast } from '../../../context/ToastContext'

export default function PatientAppointmentModal({ patient, doctorId, onClose, onSaved }) {
  const { toast } = useToast()
  const today = useMemo(() => new Date().toISOString().split('T')[0], [])
  const [date, setDate] = useState(today)
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [totalCost, setTotalCost] = useState('')
  const [saving, setSaving] = useState(false)
  const [searched, setSearched] = useState(false)

  const fetchSlots = useCallback(async () => {
    if (!doctorId || !date) return
    setSlotsLoading(true)
    setSelectedSlot(null)
    setSearched(true)
    try {
      const res = await appointmentsAPI.getAvailableSlots(doctorId, date)
      console.log(res)
      setSlots(Array.isArray(res) ? res : res?.data || [])
    } catch (err) {
      toast(err.message || 'فشل تحميل الأوقات المتاحة', 'error')
      setSlots([])
    } finally {
      setSlotsLoading(false)
    }
  }, [doctorId, date, toast])

  async function handleSave() {
    if (!selectedSlot) { toast('اختر الوقت أولاً', 'error'); return }
    if (!totalCost) { toast('أدخل التكلفة', 'error'); return }
    setSaving(true)
    try {
      await appointmentsAPI.create({
        doctorId,
        patientId: patient._id || patient.id,
        date,
        startTime: selectedSlot.startTime,
        totalCost: Number(totalCost),
      })
      toast('تم حجز الموعد بنجاح', 'success')
      onClose()
      await onSaved()
    } catch (err) {
      toast(err.message || 'فشل حفظ الموعد', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 460 }}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800 }}>موعد جديد</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{patient.fullName || patient.name}</p>
          </div>
          <button className="icon-btn" onClick={onClose} type="button"><X size={18} /></button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="input-group">
            <label>التاريخ</label>
            <input type="date" className="input-field" value={date} min={today} onChange={e => { setDate(e.target.value); setSearched(false); setSlots([]); setSelectedSlot(null) }} />
          </div>

          {!searched ? (
            <button className="btn btn-secondary" type="button" onClick={fetchSlots} disabled={!date || slotsLoading}>
              {slotsLoading ? 'جارٍ التحميل...' : 'عرض الأوقات المتاحة'}
            </button>
          ) : (
            <div className="input-group">
              <label>الأوقات المتاحة</label>
              <AvailableSlots slots={slots} selectedSlot={selectedSlot} onSelect={setSelectedSlot} loading={slotsLoading} />
            </div>
          )}

          {selectedSlot && (
            <>
              <div style={{ background: 'var(--primary-50)', border: '1px solid var(--primary-200)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={13} /> {selectedSlot.startTime} — {selectedSlot.endTime}
              </div>
              <div className="input-group">
                <label>التكلفة الإجمالية (ج.م)</label>
                <input type="number" className="input-field" min="0" placeholder="0" value={totalCost} onChange={e => setTotalCost(e.target.value)} />
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" type="button" onClick={handleSave} disabled={saving || !selectedSlot || !totalCost}>
            {saving ? 'جارٍ الحفظ...' : 'حفظ الموعد'}
          </button>
          <button className="btn btn-ghost" type="button" onClick={onClose}>إلغاء</button>
        </div>
      </div>
    </div>
  )
}
