import { Eye, Edit2, CircleDollarSign, Trash2, CalendarClock, ClipboardPlus } from 'lucide-react'
import StatusBadge, { STATUS_OPTIONS, STATUS_AR } from './components/StatusBadge'


export default function PatientRow({
  patient: p, role, canEdit, canDelete,
  onView, onEdit, onPayment, onFollowUp, onAppointments, onDelete, onStatusChange,
}) {
  const name = p.fullName || p.name || '—'
  const total = Number(p.totalCost || 0)
  const paid = Number(p.costPaid || 0)
  const rem = total - paid
  const vDate = p.visits?.[0]?.visitDate ? new Date(p.visits[0].visitDate).toLocaleDateString('ar-EG') : '—'
  const genderAr = p.gender === 'male' ? 'ذكر' : p.gender === 'female' ? 'أنثى' : p.gender || '—'
  const isDoctor = role === 'doctor'
  const isAdmin = role === 'admin'
  const isReceptionist = role === 'receptionist'

  return (
    <tr>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="avatar" style={{ width: 34, height: 34, fontSize: 13, flexShrink: 0 }}>{name[0]?.toUpperCase()}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>العمر: {p.age || '—'}</div>
          </div>
        </div>
      </td>
      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{p.phone || '—'}</td>
      <td><span className={`badge ${p.gender === 'female' ? 'badge-violet' : 'badge-blue'}`}>{genderAr}</span></td>
      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{vDate}</td>
      <td>
        {canEdit ? (
          <select
            value={(p.status || 'pending').toLowerCase()}
            onChange={e => onStatusChange(p, e.target.value)}
            style={{ border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', color: 'var(--text-main)', padding: '4px 8px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Cairo,sans-serif' }}
          >
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_AR[s]}</option>)}
          </select>
        ) : <StatusBadge status={p.status} />}
      </td>
      <td style={{ fontWeight: 600, fontSize: 13 }}>{total.toLocaleString('ar-EG')} ج.م</td>
      <td style={{ fontWeight: 600, color: 'var(--emerald-500)', fontSize: 13 }}>{paid.toLocaleString('ar-EG')} ج.م</td>
      <td><span style={{ fontWeight: 700, fontSize: 13, color: rem > 0 ? 'var(--rose-500)' : 'var(--emerald-500)' }}>{rem.toLocaleString('ar-EG')} ج.م</span></td>
      <td>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <button className="icon-btn" title="عرض" onClick={() => onView(p)}><Eye size={13} /></button>

          {isAdmin && (
            <>
              <button className="icon-btn" title="تعديل" onClick={() => onEdit(p)}><Edit2 size={13} /></button>
              {canDelete && <button className="icon-btn" title="حذف" style={{ color: 'var(--rose-500)' }} onClick={() => onDelete(p)}><Trash2 size={13} /></button>}
            </>
          )}

          {isReceptionist && (
            <>
              <button className="icon-btn" title="تعديل" onClick={() => onEdit(p)}><Edit2 size={13} /></button>
              <button className="icon-btn" title="المواعيد" onClick={() => onAppointments(p)}><CalendarClock size={13} /></button>
              <button className="icon-btn" title="تسجيل متابعة" onClick={() => onFollowUp(p)}><ClipboardPlus size={13} /></button>
              <button className="icon-btn" title="الدفع" onClick={() => onPayment(p)}><CircleDollarSign size={13} /></button>
            </>
          )}

          {/* Doctor: view only — nothing else in the table */}
        </div>
      </td>
    </tr>
  )
}
