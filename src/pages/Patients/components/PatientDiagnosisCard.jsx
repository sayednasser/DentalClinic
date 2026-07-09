import { Stethoscope } from 'lucide-react'
import { AR } from '../../../utils/ar'

export default function PatientDiagnosisCard({ patient }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Stethoscope size={14} /> {AR.diagnosis}
      </div>
      <div style={{ fontSize: 14, color: patient.diagnosis ? 'var(--text-main)' : 'var(--text-muted)', lineHeight: 1.7 }}>
        {patient.diagnosis || AR.noDiagnosis}
      </div>
    </div>
  )
}
