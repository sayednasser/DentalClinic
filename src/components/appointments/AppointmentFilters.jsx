// src/components/appointments/AppointmentFilters.jsx
import { useMemo } from 'react'
import { Search } from 'lucide-react'

export default function AppointmentFilters({
  doctors,
  doctorId,
  date,
  hideDoctor = false,
  onDoctorChange,
  onDateChange,
  onSearch,
}) {
  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  return (
    <div className="apt-filters">
      {/* Doctor */}
      {!hideDoctor && (
        <div className="input-group">
          <label>الطبيب</label>
          <select
            className="input-field"
            value={doctorId}
            onChange={(e) => onDoctorChange(e.target.value)}
          >
            <option value="">اختر الطبيب</option>

            {doctors.map((d) => (
              <option key={d._id} value={d._id}>
                {[d.firstName, d.middleName, d.lastName]
                  .filter(Boolean)
                  .join(" ")}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Date */}
      <div className="input-group">
        <label>التاريخ</label>
        <input
          type="date"
          className="input-field"
          value={date}
          onChange={e => onDateChange(e.target.value)}
        />
      </div>

      {/* Search btn */}
      <div style={{ alignSelf: 'flex-end', display: 'flex', gap: 8 }}>

        {!hideDoctor && (
          <button
            className="btn btn-primary"
            onClick={onSearch}
            disabled={!doctorId || !date}
            type="button"
          >
            <Search size={15} />
            بحث
          </button>
        )}

        <button
          className="btn btn-ghost"
          onClick={() => onDateChange(today)}
          type="button"
        >
          اليوم
        </button>

      </div>
    </div>
  )
}
