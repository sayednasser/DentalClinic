// src/components/appointments/AppointmentTable.jsx
import AppointmentRow from './AppointmentRow'
import { CalendarDays } from 'lucide-react'

function SkeletonRow() {
  return (
    <tr>
      {[80, 90, 60, 55, 65, 55, 130].map((w, i) => (
        <td key={i}>
          <div className="apt-skeleton" style={{ height: 16, width: `${w}%` }} />
        </td>
      ))}
    </tr>
  )
}

export default function AppointmentTable({
  appointments, loading, error,
  onReschedule, onStatusChange, toast,
}) {
  return (
    <div className="apt-table-wrap table-wrap">
      <table>
        <thead>
          <tr>
            <th>المريض</th>
            <th>الطبيب</th>
            <th>التاريخ</th>
            <th>الوقت</th>
            <th>الحالة</th>
            <th>التكلفة</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

          {!loading && error && (
            <tr>
              <td colSpan={7}>
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--rose-500)', fontSize: 14 }}>
                  ⚠ {error}
                </div>
              </td>
            </tr>
          )}

          {!loading && !error && appointments.length === 0 && (
            <tr>
              <td colSpan={7}>
                <div className="empty-state" style={{ padding: '48px 0' }}>
                  <CalendarDays size={36} style={{ margin: '0 auto 12px', opacity: .3 }} />
                  <p>لا توجد مواعيد لهذا الطبيب في هذا التاريخ</p>
                </div>
              </td>
            </tr>
          )}

          {!loading && !error && appointments.map(apt => (
            <AppointmentRow
              key={apt._id}
              appointment={apt}
              onReschedule={onReschedule}
              onStatusChange={onStatusChange}
              toast={toast}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
