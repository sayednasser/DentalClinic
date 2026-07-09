import { useEffect, useState, useCallback } from 'react'
import { ArrowRight, Edit2, CircleDollarSign, Trash2, ClipboardPlus } from 'lucide-react'
import { AR } from '../../../utils/ar'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import PatientHeader from '../components/PatientHeader'
import PatientInfoCard from '../components/PatientInfoCard'
import PatientPaymentCard from '../components/PatientPaymentCard'
import PatientDiagnosisCard from '../components/PatientDiagnosisCard'
import PatientTreatmentCard from '../components/PatientTreatmentCard'
import PatientAppointmentsCard from '../components/PatientAppointmentsCard'
import PatientImagesCard from '../components/PatientImagesCard'
import DoctorToolbar from '../components/DoctorToolbar'
import EditPatientModal from '../modals/EditPatientModal'
import DiagnosisModal from '../modals/DiagnosisModal'
import TreatmentModal from '../modals/TreatmentModal'
import PaymentModal from '../modals/PaymentModal'
import FollowUpVisitModal from '../modals/FollowUpVisitModal'
import UploadImageModal from '../modals/UploadImageModal'
import PatientAppointmentModal from '../modals/PatientAppointmentModal'
import RescheduleModal from '../../../components/appointments/RescheduleModal'
import { patientService } from '../services/patientService'

export default function PatientDetails({ patientId, initialPatient, doctors, role, canEdit, canDelete, onBack, onDeleted }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [patient, setPatient] = useState(initialPatient || null)
  const [loading, setLoading] = useState(!initialPatient)
  const [notFound, setNotFound] = useState(false)
  const [modal, setModal] = useState(null)
  const [imagesRefreshKey, setImagesRefreshKey] = useState(0)
  const [appointmentsRefreshKey, setAppointmentsRefreshKey] = useState(0)

  // --- جديد: خاص بإعادة جدولة الموعد ---
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showReschedule, setShowReschedule] = useState(false)

  const isAdmin = role === 'admin'
  const isDoctor = role === 'doctor'
  const isReceptionist = role === 'receptionist'

  const reload = useCallback(async () => {
    if (!patientId) return
    try {
      const fresh = await patientService.getById(patientId)
      if (fresh) setPatient(fresh)
      else if (!initialPatient) setNotFound(true)
    } catch {
      if (!initialPatient) setNotFound(true)
    } finally {
      setLoading(false)
    }
    console.log("PATIENT DATA:", patient)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId])

  useEffect(() => { reload() }, [reload])

  async function handleDelete() {
    if (!patient) return
    if (!confirm(`حذف "${patient.fullName || patient.name}"؟`)) return
    try {
      await patientService.delete(patient._id || patient.id)
      toast(AR.delete + ' تم بنجاح', 'success')
      onDeleted?.()
    } catch (err) {
      toast(err.message || 'فشل الحذف', 'error')
    }
  }

  // --- جديد: يفتح مودال إعادة الجدولة لموعد محدد (يُستخدم من الكارت) ---
  function handleOpenReschedule(appointment) {
    setSelectedAppointment(appointment)
    setShowReschedule(true)
  }

  // --- جديد: يُستخدم من زر "إعادة جدولة" في DoctorToolbar
  // يبحث عن أقرب موعد بحالة "scheduled" ويفتح له المودال ---
  async function handleOpenRescheduleFromToolbar() {
    try {
      const list = await patientService.getAppointments(pid)
      const upcoming = [...list]
        .filter(a => a.status === 'scheduled')
        .sort((a, b) => new Date(a.date || a.appointmentDate) - new Date(b.date || b.appointmentDate))[0]

      if (!upcoming) {
        toast('لا يوجد موعد مجدول لإعادة جدولته', 'error')
        return
      }
      handleOpenReschedule(upcoming)
    } catch (err) {
      toast(err.message || 'فشل تحميل المواعيد', 'error')
    }
  }

  if (loading) {
    return <div className="loading-center" style={{ minHeight: 240 }}><div className="spinner" /><span>{AR.loadingPatient}</span></div>
  }

  if (!patient || notFound) {
    return (
      <div className="card" style={{ padding: 32, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>{AR.patientNotFound}</p>
        <button className="btn btn-ghost" onClick={onBack}><ArrowRight size={14} /> {AR.backToPatients}</button>
      </div>
    )
  }

  const pid = patient._id || patient.id
  const doctorIdForAppointment = typeof patient.doctorId === 'object' ? patient.doctorId?._id : patient.doctorId
  return (
    <div className="patient-details-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <button className="btn btn-ghost" onClick={onBack} style={{ padding: '6px 12px' }}>
          <ArrowRight size={14} /> {AR.backToPatients}
        </button>

        {/* Admin: fully read-only, no action buttons here */}

        {/* Receptionist: edit / follow-up / payment only */}
        {isReceptionist && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {canEdit && <button className="btn btn-secondary" onClick={() => setModal('edit')}><Edit2 size={13} /> {AR.edit}</button>}
            {canEdit && <button className="btn btn-secondary" onClick={() => setModal('followup')}><ClipboardPlus size={13} /> {AR.followUpVisit}</button>}
            {canEdit && <button className="btn btn-secondary" onClick={() => setModal('payment')}><CircleDollarSign size={13} /> {AR.payment}</button>}
          </div>
        )}

        {isAdmin && canDelete && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-secondary" style={{ color: 'var(--rose-500)' }} onClick={handleDelete}><Trash2 size={13} /> {AR.delete}</button>
          </div>
        )}
      </div>

      {/* Doctor: clean EMR-style toolbar, only place clinical actions live */}
      {(isDoctor || isReceptionist) && (
        <DoctorToolbar
          onDiagnosis={() => setModal('diagnosis')}
          onTreatment={() => setModal('treatment')}
          onAddImage={() => setModal('upload-image')}
          onAddAppointment={() => setModal('add-appointment')}
          onReschedule={isDoctor ? handleOpenRescheduleFromToolbar : undefined}
        />
      )}

      {/* Row 1: Patient information | Financial summary + Appointments (matched size) */}
      <div className="patient-top-grid">
        <div className="card">
          <PatientHeader patient={patient} />
          <PatientInfoCard patient={patient} doctors={doctors} />
        </div>
        <div className="patient-side-stack">
          <PatientPaymentCard patient={patient} />
          <div className="patient-appointments-mini">
            <PatientAppointmentsCard
              patientId={pid}
              refreshKey={appointmentsRefreshKey}
              onReschedule={handleOpenReschedule}
            />
          </div>
        </div>
      </div>

      {/* Row 2: Diagnosis | Treatment plan (side by side) */}
      <div className="grid-2" style={{ gap: 10, alignItems: 'start' }}>
        <PatientDiagnosisCard patient={patient} />
        <PatientTreatmentCard patient={patient} />
      </div>

      {/* Row 3: Medical images (full width) */}
      <div className="patient-images-panel">
        <PatientImagesCard patientId={pid} refreshKey={imagesRefreshKey} />
      </div>

      {modal === 'edit' && (
        <EditPatientModal patient={patient} doctors={doctors} onClose={() => setModal(null)} onSaved={reload} />
      )}
      {modal === 'diagnosis' && (
        <DiagnosisModal patient={patient} onClose={() => setModal(null)} onSaved={reload} />
      )}
      {modal === 'treatment' && (
        <TreatmentModal patient={patient} onClose={() => setModal(null)} onSaved={reload} />
      )}
      {modal === 'payment' && (
        <PaymentModal patient={patient} onClose={() => setModal(null)} onSaved={reload} />
      )}
      {modal === 'followup' && (
        <FollowUpVisitModal patient={patient} doctors={doctors} onClose={() => setModal(null)} onSaved={reload} />
      )}
      {modal === 'upload-image' && (
        <UploadImageModal
          patientId={pid}
          onClose={() => setModal(null)}
          onUploaded={() => { setModal(null); setImagesRefreshKey(k => k + 1) }}
        />
      )}
      {modal === 'add-appointment' && (
        <PatientAppointmentModal
          patient={patient}
          doctorId={doctorIdForAppointment}
          onClose={() => setModal(null)}
          onSaved={() => setAppointmentsRefreshKey(k => k + 1)}
        />
      )}

      {/* --- جديد: مودال إعادة جدولة الموعد --- */}
      {showReschedule && selectedAppointment && (
        <RescheduleModal
          appointment={selectedAppointment}
          onClose={() => setShowReschedule(false)}
          onSuccess={() => {
            setShowReschedule(false)
            setSelectedAppointment(null)
            setAppointmentsRefreshKey(k => k + 1)
          }}
          toast={(type, message) => toast(message, type)}
        />
      )}
    </div>
  )
}
