import { useState } from 'react'
import { AR } from '../../../utils/ar'
import { useToast } from '../../../context/ToastContext'
import Modal from '../components/Modal'
import { patientService } from '../services/patientService'

export default function TreatmentModal({ patient, onClose, onSaved }) {
  const { toast } = useToast()
  const [treatment, setTreatment] = useState(patient.treatment || '')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(ev) {
    ev.preventDefault()
    setSubmitting(true)
    try {
      await patientService.updateTreatment(patient._id || patient.id, { treatment })
      toast('تم تحديث العلاج', 'success')
      onClose()
      await onSaved()
    } catch (err) {
      toast(err.message || 'فشل', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title={`${AR.treatment} — ${patient.fullName || patient.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="input-group">
            <label>{AR.treatment}</label>
            <textarea className="input-field" rows={5} placeholder={AR.treatmentDetails} value={treatment} onChange={e => setTreatment(e.target.value)} style={{ resize: 'vertical' }} />
          </div>
        </div>
        <div className="modal-footer">
          <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? AR.saving : AR.updateTreatment}</button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>{AR.cancel}</button>
        </div>
      </form>
    </Modal>
  )
}
