import StatusBadge from './StatusBadge'

export default function PatientHeader({ patient }) {
  const name = patient.fullName || patient.name || '—'
  const genderAr = patient.gender === 'male' ? 'ذكر' : patient.gender === 'female' ? 'أنثى' : patient.gender || '—'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
      <div className="avatar" style={{ width: 60, height: 60, fontSize: 22, flexShrink: 0 }}>{name[0]}</div>
      <div>
        <h4 style={{ fontSize: 20, fontWeight: 700 }}>{name}</h4>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>العمر {patient.age || '—'} · {genderAr}</div>
        <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}><StatusBadge status={patient.status} /></div>
      </div>
    </div>
  )
}
