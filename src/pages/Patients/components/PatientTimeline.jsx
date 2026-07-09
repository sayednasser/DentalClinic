// Same idea as PatientImages: no backend endpoint for a visit timeline exists yet.
// Renders only if `timeline` or `history` is already present on the patient record.
export default function PatientTimeline({ patient }) {
  const events = patient.timeline || patient.history || []
  if (!events.length) return null

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
        سجل الزيارات
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {events.map((ev, i) => (
          <div key={ev._id || i} style={{ display: 'flex', gap: 10, paddingBottom: 10, borderBottom: i < events.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--teal-500)', marginTop: 5, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{ev.title || ev.label || '—'}</div>
              {ev.date && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(ev.date).toLocaleDateString('ar-EG')}</div>}
              {ev.note && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{ev.note}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
