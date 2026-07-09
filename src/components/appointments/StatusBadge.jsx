// src/components/appointments/StatusBadge.jsx
const STATUS_MAP = {
  scheduled: { label: 'مجدول', cls: 'badge-blue' },
  completed: { label: 'مكتمل', cls: 'badge-green' },
  cancelled: { label: 'ملغي', cls: 'badge-red' },
  'no-show': { label: 'لم يحضر', cls: 'badge-amber' },
}

export default function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || {
    label: status || '—',
    cls: 'badge-teal'
  }

  return (
    <span className={`badge ${s.cls}`}>
      {s.label}
    </span>
  )
}
