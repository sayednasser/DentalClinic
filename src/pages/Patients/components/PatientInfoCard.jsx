import { Phone, MapPin, Calendar, Stethoscope, ClipboardList } from 'lucide-react'
import { getDoctorName, findDoctorById } from '../utils/getDoctorName'
import { AR } from '../../../utils/ar'
import StatusBadge from './StatusBadge'

export default function PatientInfoCard({ patient, doctors }) {
const doctor =
  typeof patient.doctorId === "object"
    ? patient.doctorId
    : findDoctorById(doctors, patient.doctorId);

const drName = doctor
  ? `${doctor.fullName || `${doctor.firstName} ${doctor.lastName}`}`
  : "—";

  const firstVisit = patient.firstVisitDate || patient.createdAt

  const rows = [
    [Phone, AR.phone || 'الهاتف', patient.phone],
    [MapPin, 'العنوان', patient.address],
    [Calendar, AR.firstVisit, firstVisit ? new Date(firstVisit).toLocaleDateString('ar-EG') : '—'],
    [Stethoscope, AR.assignedDoctorLbl, drName],
  ]

  return (
    <div>
      <div className="grid-2" style={{ gap: 12, marginBottom: 12 }}>
        {rows.map(([Icon, label, val]) => val ? (
          <div key={label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Icon size={15} color="var(--teal-600)" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-muted)' }}>{label}</div>
              <div style={{ fontSize: 14, marginTop: 2 }}>{val}</div>
            </div>
          </div>
        ) : null)}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <ClipboardList size={15} color="var(--teal-600)" />
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-muted)' }}>{AR.patientStatus}</div>
        <StatusBadge status={patient.status} />
      </div>
      {patient.notes && (
        <div style={{ background: 'var(--surface)', borderRadius: 10, padding: 14, marginTop: 14, fontSize: 13, color: 'var(--text-muted)', borderRight: '3px solid var(--teal-400)' }}>
          <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: 4 }}>ملاحظات</strong>
          {patient.notes}
        </div>
      )}
    </div>
  )
}
