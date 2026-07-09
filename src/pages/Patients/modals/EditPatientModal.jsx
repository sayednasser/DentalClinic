import { useState } from 'react'
import { User, Hash, Phone } from 'lucide-react'
import { AR } from '../../../utils/ar'
import { useToast } from '../../../context/ToastContext'
import Modal from '../components/Modal'
import DoctorSelect from '../components/DoctorSelect'
import GenderToggle from '../components/GenderToggle'
import { patientService } from '../services/patientService'

function buildEditForm(p) {
  return {
    fullName: p.fullName || p.name || '',
    phone: p.phone || '',
    address: p.address || '',
    age: p.age || '',
    gender: p.gender || '',
    notes: p.notes || '',
    doctorId:
      typeof p.doctorId === 'object'
        ? p.doctorId?._id
        : p.doctorId || p.doctor?._id || '',
    totalCost: p.totalCost || '',
    costPaid: p.costPaid || '',
  }
}

export default function EditPatientModal({ patient, doctors, onClose, onSaved }) {
  const { toast } = useToast()
  const [form, setForm] = useState(() => buildEditForm(patient))
  const [submitting, setSubmitting] = useState(false)
  const setE = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(ev) {
    ev.preventDefault()
    setSubmitting(true)
    try {
      const payload = {}
      ;['fullName', 'phone', 'address', 'age', 'gender', 'notes', 'doctorId'].forEach(k => {
        if (form[k]) payload[k] = form[k]
      })
      if (form.totalCost) payload.totalCost = Number(form.totalCost)
      if (form.costPaid !== '') payload.costPaid = Number(form.costPaid)
      await patientService.update(patient._id || patient.id, payload)
      toast('تم تحديث البيانات', 'success')
      onClose()
      await onSaved()
    } catch (err) {
      toast(err.message || 'فشل التحديث', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title={`تعديل — ${patient.fullName || patient.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="grid-2">
            <div className="input-group">
              <label>{AR.fullName}</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', right: 12, top: '50%' }} />
                <input className="input-field" value={form.fullName} onChange={e => setE('fullName', e.target.value)} style={{ paddingRight: 36 }} />
              </div>
            </div>
            <div className="input-group">
              <label>{AR.age}</label>
              <div style={{ position: 'relative' }}>
                <Hash size={15} style={{ position: 'absolute', right: 12, top: '50%' }} />
                <input className="input-field" type="number" value={form.age} onChange={e => setE('age', e.target.value)} style={{ paddingRight: 36 }} />
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>{AR.phone}</label>
              <div style={{ position: 'relative' }}>
                <Phone size={15} style={{ position: 'absolute', right: 12, top: '50%' }} />
                <input className="input-field" value={form.phone} onChange={e => setE('phone', e.target.value)} style={{ paddingRight: 36 }} />
              </div>
            </div>
            <GenderToggle value={form.gender} onChange={v => setE('gender', v)} />
          </div>

          <div className="input-group">
            <label>{AR.address}</label>
            <input className="input-field" value={form.address} onChange={e => setE('address', e.target.value)} />
          </div>


          <DoctorSelect doctors={doctors} value={form.doctorId} onChange={v => setE('doctorId', v)} />

          <div className="input-group">
            <label>{AR.notes}</label>
            <textarea className="input-field" rows={3} value={form.notes} onChange={e => setE('notes', e.target.value)} />
          </div>
        </div>

        <div className="modal-footer">
          <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? AR.saving : AR.saveChanges}</button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>{AR.cancel}</button>
        </div>
      </form>
    </Modal>
  )
}
