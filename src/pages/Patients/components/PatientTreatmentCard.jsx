import { Pill } from 'lucide-react'
import { AR } from '../../../utils/ar'

export default function PatientTreatmentCard({ patient }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Pill size={14} /> {AR.treatment}
      </div>
      <div style={{ fontSize: 14, color: patient.treatment ? 'var(--text-main)' : 'var(--text-muted)', lineHeight: 1.7 }}>
        {patient.treatment || AR.noTreatment}
      </div>
    </div>
  )
}
