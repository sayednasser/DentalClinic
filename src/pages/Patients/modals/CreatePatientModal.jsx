import { useState } from 'react'
import { User, Phone, MapPin, Hash, Calendar } from 'lucide-react'
import { AR } from '../../../utils/ar'
import { useToast } from '../../../context/ToastContext'
import Modal from '../components/Modal'
import ErrMsg from '../components/ErrMsg'
import DoctorSelect from '../components/DoctorSelect'
import GenderToggle from '../components/GenderToggle'
import PaymentBox from '../components/PaymentBox'
import { patientService } from '../services/patientService'
import {
  createEmptyCreateForm,
  getToday,
  validateCreatePatient
} from '../utils/patientValidation'

export default function CreatePatientModal({ doctors, onClose, onSaved }) {
  console.log("Doctors =", doctors);

  const { toast } = useToast()
  const [form, setForm] = useState(createEmptyCreateForm())
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const setC = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }
  const iS = key => ({ paddingRight: 36, borderColor: errors[key] ? 'var(--rose-500)' : undefined })

  const tabs = [
    { id: 'info', label: 'بيانات المريض', icon: '👤' },
    { id: 'visit', label: 'الطبيب والزيارة', icon: '🩺' },
    { id: 'payment', label: 'المدفوعات', icon: '💳' },
  ]
  const activeTab = form._tab || 'info'
  const setTab = t => setC('_tab', t)
  const hasInfoErr = errors.fullName || errors.gender || errors.address
  const hasVisitErr = errors.doctorId
  const hasPayErr = errors.totalCost || errors.costPaid

  async function handleSubmit(ev) {
    ev.preventDefault()
    const e = validateCreatePatient(form)
    if (Object.keys(e).length) {
      setErrors(e)
      if (e.fullName || e.gender || e.address) setTab('info')
      else if (e.doctorId) setTab('visit')
      else if (e.totalCost || e.costPaid) setTab('payment')
      return
    }
    setSubmitting(true)
    console.log("Selected doctorId:", form.doctorId);
    console.log("Doctors:", doctors);
    try {
      await patientService.create({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        age: String(form.age),
        gender: form.gender,
        notes: form.notes.trim() || undefined,
        doctorId: form.doctorId,
        totalCost: Number(form.totalCost),
        costPaid: Number(form.costPaid),
        visitDate: form.visitDate || getToday(),
      })
      toast('تم إضافة المريض بنجاح', 'success')
      onClose()
      await onSaved()
    } catch (err) {
      toast(err.message || 'فشلت الإضافة', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title={AR.addNewPatient} onClose={onClose} maxWidth={580}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--surface)', paddingRight: 20, paddingLeft: 20, gap: 4 }}>
          {tabs.map(t => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} style={{
              padding: '10px 16px', fontSize: 13, fontWeight: 600, fontFamily: 'Cairo,sans-serif',
              background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              borderBottom: activeTab === t.id ? '2px solid var(--teal-500)' : '2px solid transparent',
              color: activeTab === t.id ? 'var(--teal-600)' : 'var(--text-muted)',
              marginBottom: -1, transition: 'color .15s',
              position: 'relative'
            }}>
              <span>{t.icon}</span> {t.label}
              {((t.id === 'info' && hasInfoErr) || (t.id === 'visit' && hasVisitErr) || (t.id === 'payment' && hasPayErr)) && (
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--rose-500)', position: 'absolute', top: 8, left: 6 }} />
              )}
            </button>
          ))}
        </div>

        <div className="modal-body" style={{ minHeight: 240 }}>
          {activeTab === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="grid-2">
                <div className="input-group">
                  <label>{AR.fullName} <span style={{ color: 'var(--rose-500)' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <User size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input className="input-field" placeholder="أحمد حسن" value={form.fullName} onChange={e => setC('fullName', e.target.value)} style={iS('fullName')} />
                  </div>
                  <ErrMsg msg={errors.fullName} />
                </div>
                <div className="input-group">
                  <label>{AR.age}</label>
                  <div style={{ position: 'relative' }}>
                    <Hash size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input className="input-field" type="number" min="1" max="120" placeholder="25" value={form.age} onChange={e => setC('age', e.target.value)} style={iS('age')} />
                  </div>
                  <ErrMsg msg={errors.age} />
                </div>
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label>{AR.phone}</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input className="input-field" placeholder="01xxxxxxxxx" value={form.phone} onChange={e => setC('phone', e.target.value)} style={iS('phone')} />
                  </div>
                  <ErrMsg msg={errors.phone} />
                </div>
                <GenderToggle value={form.gender} onChange={v => setC('gender', v)} error={errors.gender} />
              </div>
              <div className="input-group">
                <label>{AR.address} <span style={{ color: 'var(--rose-500)' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <input className="input-field" placeholder="القاهرة، مدينة نصر..." value={form.address} onChange={e => setC('address', e.target.value)} style={iS('address')} />
                </div>
                <ErrMsg msg={errors.address} />
              </div>
              <div className="input-group">
                <label>{AR.notes}</label>
                <textarea className="input-field" rows={3} placeholder={AR.notesPlaceholder} value={form.notes} onChange={e => setC('notes', e.target.value)} style={{ resize: 'vertical' }} />
              </div>
            </div>
          )}

          {activeTab === 'visit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <DoctorSelect doctors={doctors} value={form.doctorId} onChange={v => setC('doctorId', v)} error={errors.doctorId} />
              <div className="input-group">
                <label>{AR.visitDate}</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <input className="input-field" type="date" value={form.visitDate} onChange={e => setC('visitDate', e.target.value)} style={{ paddingRight: 36 }} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <PaymentBox
                key="create-pay"
                totalCost={form.totalCost}
                costPaid={form.costPaid}
                onTotalChange={v => setC('totalCost', v)}
                onPaidChange={v => setC('costPaid', v)}
                errorTotal={errors.totalCost}
                errorPaid={errors.costPaid}
              />
            </div>
          )}
        </div>

        <div className="modal-footer">
          {activeTab !== 'info' && (
            <button type="button" className="btn btn-ghost" onClick={() => setTab(activeTab === 'payment' ? 'visit' : 'info')}>
              → السابق
            </button>
          )}
          {activeTab !== 'payment' ? (
            <button type="button" className="btn btn-primary" onClick={() => setTab(activeTab === 'info' ? 'visit' : 'payment')}>
              التالي ←
            </button>
          ) : (
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? AR.adding : AR.addPatient}</button>
          )}
          <button type="button" className="btn btn-ghost" onClick={onClose}>{AR.cancel}</button>
        </div>
      </form>
    </Modal>
  )
}
