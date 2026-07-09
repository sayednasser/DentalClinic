// src/components/appointments/AvailableSlots.jsx
import { Clock } from 'lucide-react'

export default function AvailableSlots({ slots, selectedSlot, onSelect, loading }) {
  if (loading) {
    return (
      <div className="slots-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="apt-skeleton" style={{ height: 44 }} />
        ))}
      </div>
    )
  }

  if (!slots || slots.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
        <Clock size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: .35 }} />
        <p style={{ fontSize: 13 }}>لا توجد أوقات متاحة في هذا اليوم</p>
      </div>
    )
  }

  return (
    <div className="slots-grid">
      {slots.map(slot => {
        const key = slot.startTime || slot._id || JSON.stringify(slot)
        const isSelected = selectedSlot?.startTime === slot.startTime
        return (
          <button
            key={key}
            className={`slot-btn${isSelected ? ' selected' : ''}`}
            onClick={() => onSelect(slot)}
            type="button"
          >
            <div style={{ fontWeight: 700, fontSize: 13 }}>{slot.startTime}</div>
            <div style={{ fontSize: 11, opacity: .7 }}>{slot.endTime}</div>
          </button>
        )
      })}
    </div>
  )
}
