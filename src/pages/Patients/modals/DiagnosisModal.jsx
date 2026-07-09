import { useState } from 'react'
import { AR } from '../../../utils/ar'
import { useToast } from '../../../context/ToastContext'
import Modal from '../components/Modal'
import { patientService } from '../services/patientService'

export default function DiagnosisModal({ patient, onClose, onSaved }) {
  const { toast } = useToast()
  const [diagnosis, setDiagnosis] = useState(patient.diagnosis || '')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(ev) {
    ev.preventDefault()
    setSubmitting(true)
    try {
      await patientService.updateDiagnosis(patient._id || patient.id, { diagnosis })
      toast('تم تحديث التشخيص', 'success')
      onClose()
      await onSaved()
    } catch (err) {
      toast(err.message || 'فشل', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title={`${AR.diagnosis} — ${patient.fullName || patient.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="input-group">
            <label>{AR.diagnosis}</label>
            <textarea className="input-field" rows={5} placeholder={AR.diagnosisDetails} value={diagnosis} onChange={e => setDiagnosis(e.target.value)} style={{ resize: 'vertical' }} />
          </div>
        </div>
        <div className="modal-footer">
          <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? AR.saving : AR.updateDiagnosis}</button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>{AR.cancel}</button>
        </div>
      </form>
    </Modal>
  )
}
