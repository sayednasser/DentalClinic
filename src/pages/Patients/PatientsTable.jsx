  import { Users, UserPlus } from 'lucide-react'
  import { AR } from '../../utils/ar'
  import PatientRow from './PatientRow'

  export default function PatientsTable({
    patients, loading, search, role, canEdit, canDelete, canCreate,
    onCreate, onView, onEdit, onPayment, onFollowUp, onAppointments, onDelete, onStatusChange,
  }) {
    return (
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : patients.length === 0 ? (
          <div className="empty-state">
            <Users size={40} />
            <h3>{AR.noPatients}</h3>
            <p>{search ? 'جرب بحثاً مختلفاً' : AR.addFirst}</p>
            {canCreate && !search && (
              <button className="btn btn-primary" onClick={onCreate} style={{ marginTop: 8 }}>
                <UserPlus size={14} /> {AR.addNewPatient}
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>المريض</th><th>الهاتف</th><th>الجنس</th><th>تاريخ الزيارة</th>
                  <th>الحالة</th><th>الإجمالي</th><th>مدفوع</th><th>متبقي</th><th>{AR.actions}</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p, i) => (
                  <PatientRow
                    key={p._id || p.id || i}
                    patient={p}
                    role={role}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    onView={onView}
                    onEdit={onEdit}
                    onPayment={onPayment}
                    onFollowUp={onFollowUp}
                    onAppointments={onAppointments}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }
