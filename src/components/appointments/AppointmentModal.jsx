// src/components/appointments/AppointmentModal.jsx
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { X, Clock } from 'lucide-react'
import { appointmentsAPI, patientsAPI } from '../../api'
import AvailableSlots from './AvailableSlots'

const STEPS = ['الطبيب والتاريخ', 'الوقت', 'المريض']

export default function AppointmentModal({ doctors, onClose, onSuccess, toast }) {
  const { user } = useAuth()
  console.log("USER =", user);
  const isDoctor = user?.role === 'doctor' || user?.role === 2

  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [slotsLoading, setSlotsLoading] = useState(false)

  const [doctorId, setDoctorId] = useState(isDoctor ? (user?._id || user?.id) : '')
  const [date, setDate] = useState('')
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)

  const [patientId, setPatientId] = useState('')
  const [patientSearch, setPatientSearch] = useState('')
  const [patientSearchResults, setPatientSearchResults] = useState([])
  const [patientSearching, setPatientSearching] = useState(false)
  const [showPatientResults, setShowPatientResults] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const patientSearchRequestId = useRef(0)
  const [totalCost, setTotalCost] = useState('')

  const today = useMemo(() => new Date().toISOString().split('T')[0], [])
  const selectedDoctor = useMemo(() => {
    if (isDoctor) {
      return (
        doctors.find(d => d._id === doctorId) || {
          fullName:
            user?.fullName ||
            [user?.firstName, user?.middleName, user?.lastName]
              .filter(Boolean)
              .join(' ')
        }
      )
    }

    return doctors.find(d => d._id === doctorId)
  }, [doctors, doctorId, isDoctor, user])
  useEffect(() => {
    if (!isDoctor) return
    setDoctorId(user?._id || user?.id)
  }, [isDoctor, user])

  // Debounced patient search (only triggers when the user types, no bulk loading)
  useEffect(() => {
    const query = patientSearch.trim()

    if (selectedPatient) return


    if (query.length < 2) {
      setPatientSearchResults([])
      setPatientSearching(false)
      setShowPatientResults(false)
      return
    }

    setShowPatientResults(true)
    setPatientSearching(true)

    const requestId = ++patientSearchRequestId.current
    const timer = setTimeout(() => {
      patientsAPI.search(query)
        .then(res => {
          console.log("SEARCH RESPONSE =", res)

          if (patientSearchRequestId.current !== requestId) return
          const list = Array.isArray(res) ? res : res?.data || []
          console.log("PATIENTS =", list)

          setPatientSearchResults(list)
        })
        .catch(() => {
          if (patientSearchRequestId.current !== requestId) return
          setPatientSearchResults([])
        })
        .finally(() => {
          if (patientSearchRequestId.current !== requestId) return
          setPatientSearching(false)
        })
    }, 400)

    return () => clearTimeout(timer)
  }, [patientSearch, selectedPatient])

  const handleSelectPatient = useCallback((p) => {
    setSelectedPatient(p)
    setPatientId(p._id)
    setPatientSearch(p.fullName || p.name || '')
    setPatientSearchResults([])
    setShowPatientResults(false)
  }, [])

  const handlePatientSearchChange = useCallback((e) => {
    const value = e.target.value
    setPatientSearch(value)
    if (selectedPatient) {
      setSelectedPatient(null)
      setPatientId('')
    }
  }, [selectedPatient])

  const fetchSlots = useCallback(async () => {
    if (!doctorId || !date) return
    setSlotsLoading(true)
    setSlots([])
    setSelectedSlot(null)
    try {

      const res = await appointmentsAPI.getAvailableSlots(doctorId, date)

      setSlots(Array.isArray(res) ? res : res?.data || [])
      setStep(2)
    } catch (err) {
      toast?.('error', err.message || 'فشل تحميل الأوقات المتاحة')
    } finally {
      setSlotsLoading(false)
    }
  }, [doctorId, date, toast])


  const handleSave = useCallback(async () => {
    if (!patientId) { toast?.('error', 'اختر المريض'); return }
    if (!selectedSlot) { toast?.('error', 'اختر الوقت'); return }
    if (!totalCost) { toast?.('error', 'أدخل التكلفة'); return }
    setSaving(true)
    try {
      await appointmentsAPI.create({
        doctorId,
        patientId,
        date,
        startTime: selectedSlot.startTime,
        totalCost: Number(totalCost),
      })
      toast?.('success', 'تم حجز الموعد بنجاح')
      onSuccess()
    } catch (err) {
      toast?.('error', err.message || 'فشل حفظ الموعد')
    } finally {
      setSaving(false)
    }
  }, [doctorId, patientId, date, selectedSlot, totalCost, toast, onSuccess])

  const dateFmt = date
    ? new Date(date + 'T12:00:00').toLocaleDateString('ar-EG', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
    : ''

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 520 }}>

        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-main)' }}>موعد جديد</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
              {step === 1 && 'اختر الطبيب والتاريخ'}
              {step === 2 && 'اختر الوقت المناسب'}
              {step === 3 && 'بيانات المريض والتكلفة'}
            </p>
          </div>
          <button className="icon-btn" onClick={onClose} type="button"><X size={18} /></button>
        </div>

        {/* Steps */}
        <div className="apt-steps">
          {STEPS.map((label, i) => {
            const num = i + 1
            const cls = step === num ? 'active' : step > num ? 'done' : ''
            return (
              <div key={num} className={`apt-step ${cls}`}>
                <div className="apt-step__num">
                  {step > num ? '✓' : num}
                </div>
                <span className="apt-step__label">{label}</span>
              </div>
            )
          })}
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Step 1 */}
          {step === 1 && (
            <>
              {!isDoctor && (
                <div className="input-group">
                  <label>الطبيب</label>

                  <select
                    className="input-field"
                    value={doctorId}
                    onChange={e => setDoctorId(e.target.value)}
                  >
                    <option value="">— اختر الطبيب —</option>

                    {doctors.map(d => (
                      <option key={d._id} value={d._id}>
                        {[d.firstName, d.middleName, d.lastName]
                          .filter(Boolean)
                          .join(' ')}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="input-group">
                <label>التاريخ</label>

                <input
                  type="date"
                  className="input-field"
                  value={date}
                  min={today}
                  onChange={e => setDate(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Step 2 */}
          {step === 2 && <>
            <div style={{
              background: 'var(--slate-50)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: '10px 14px',
              fontSize: 13, display: 'flex', gap: 12, flexWrap: 'wrap',
            }}>
              <strong style={{ color: 'var(--text-main)' }}>
                {selectedDoctor?.fullName || selectedDoctor?.name}
              </strong>
              <span style={{ color: 'var(--text-muted)' }}>{dateFmt}</span>
            </div>
            <div className="input-group">
              <label>الأوقات المتاحة</label>
              <AvailableSlots
                slots={slots} selectedSlot={selectedSlot}
                onSelect={setSelectedSlot} loading={slotsLoading}
              />
            </div>
          </>}

          {/* Step 3 */}
          {step === 3 && <>
            {/* Summary */}
            <div style={{
              background: 'var(--primary-50)', border: '1px solid var(--primary-200)',
              borderRadius: 'var(--radius-sm)', padding: '10px 14px',
              display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 13,
            }}>
              <span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>
                <Clock size={13} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
                {selectedSlot?.startTime} — {selectedSlot?.endTime}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                {selectedDoctor?.fullName || selectedDoctor?.name}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>{dateFmt}</span>
            </div>

            <div className="input-group" style={{ position: 'relative' }}>
              <label>بحث عن مريض</label>
              <input
                className="input-field"
                placeholder="اكتب اسم المريض أو رقم الهاتف..."
                value={patientSearch}
                onChange={handlePatientSearchChange}
                onFocus={() => {
                  if (!selectedPatient && patientSearch.trim().length >= 2) {
                    setShowPatientResults(true)
                  }
                }}
                autoComplete="off"
              />

              {showPatientResults && !selectedPatient && (
                <div
                  className="card"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    left: 0,
                    zIndex: 20,
                    marginTop: 4,
                    maxHeight: 220,
                    overflowY: 'auto',
                    padding: 4,
                  }}
                >
                  {patientSearching && (
                    <div style={{ padding: '10px 12px', fontSize: 13, color: 'var(--text-muted)' }}>
                      جارٍ البحث...
                    </div>
                  )}

                  {!patientSearching && patientSearchResults.length === 0 && (
                    <div style={{ padding: '10px 12px', fontSize: 13, color: 'var(--text-muted)' }}>
                      لا يوجد مرضى
                    </div>
                  )}

                  {!patientSearching && patientSearchResults.map(p => (
                    <div
                      key={p._id}
                      onClick={() => handleSelectPatient(p)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--slate-50)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main)' }}>
                        {p.fullName || p.name}
                      </div>
                      {p.phone && (
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          {p.phone}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedPatient && (
              <div style={{
                background: 'var(--primary-50)', border: '1px solid var(--primary-200)',
                borderRadius: 'var(--radius-sm)', padding: '10px 14px',
                display: 'flex', flexDirection: 'column', gap: 2, fontSize: 13,
              }}>
                <span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>
                  ✓ تم اختيار المريض
                </span>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                  {selectedPatient.fullName || selectedPatient.name}
                </span>
                {selectedPatient.phone && (
                  <span style={{ color: 'var(--text-muted)' }}>{selectedPatient.phone}</span>
                )}
              </div>
            )}

            <div className="input-group">
              <label>التكلفة الإجمالية (ج.م)</label>
              <input
                type="number" className="input-field" placeholder="0" min="0"
                value={totalCost} onChange={e => setTotalCost(e.target.value)}
              />
            </div>
          </>}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} type="button">إلغاء</button>

          {step > 1 && (
            <button className="btn btn-ghost" onClick={() => setStep(s => s - 1)} type="button">
              رجوع
            </button>
          )}

          {step === 1 && (
            !isDoctor ? (
              <button
                className="btn btn-primary"
                type="button"
                onClick={fetchSlots}
                disabled={!doctorId || !date || slotsLoading}
              >
                {slotsLoading ? 'جارٍ التحميل...' : 'التالي'}
              </button>
            ) : (
              <button
                className="btn btn-primary"
                type="button"
                onClick={fetchSlots}
                disabled={!date || slotsLoading}
              >
                {slotsLoading ? 'جارٍ التحميل...' : 'التالي'}
              </button>
            )
          )}
          {step === 2 && (
            <button
              className="btn btn-primary" type="button"
              onClick={() => { if (selectedSlot) setStep(3); else toast?.('error', 'اختر وقتاً أولاً') }}
              disabled={!selectedSlot}
            >
              التالي
            </button>
          )}
          {step === 3 && (
            <button
              className="btn btn-primary" type="button"
              onClick={handleSave}
              disabled={saving || !patientId || !totalCost}
            >
              {saving ? 'جارٍ الحفظ...' : 'حفظ الموعد'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
