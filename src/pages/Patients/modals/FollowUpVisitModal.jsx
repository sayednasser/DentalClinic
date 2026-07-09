import { useState } from 'react'
import { useToast } from '../../../context/ToastContext'
import Modal from '../components/Modal'
import { patientService } from '../services/patientService'

export default function FollowUpVisitModal({
  patient,
  onClose,
  onSaved
}) {
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    setSubmitting(true)

    try {
      await patientService.followUp(
        patient._id || patient.id
      )

      toast('تم تسجيل زيارة المتابعة', 'success')

      onClose()

      await onSaved?.()

    } catch (err) {

      toast(
        err.message || 'فشل تسجيل الزيارة',
        'error'
      )

    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title={`تسجيل متابعة — ${patient.fullName || patient.name}`}
      onClose={onClose}
      maxWidth={450}
    >
      <div
        className="modal-body"
        style={{
          padding: 20,
          textAlign: 'center'
        }}
      >
        <p>
          هل تريد تسجيل زيارة جديدة لهذا المريض اليوم؟
        </p>

        <p
          style={{
            marginTop: 10,
            fontSize: 13,
            color: 'var(--text-muted)'
          }}
        >
          سيتم إضافة زيارة جديدة إلى سجل زيارات المريض.
        </p>
      </div>

      <div className="modal-footer">
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting
            ? 'جاري التسجيل...'
            : 'تسجيل المتابعة'}
        </button>

        <button
          className="btn btn-ghost"
          onClick={onClose}
        >
          إلغاء
        </button>
      </div>
    </Modal>
  )
}