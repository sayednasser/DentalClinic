import { AR } from '../../../utils/ar'

export default function PatientPaymentCard({ patient }) {
  const total = Number(patient.totalCost || 0)
  const paid = Number(patient.costPaid || 0)
  const rem = total - paid

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>{AR.financialStatus}</div>
      <div className="grid-3" style={{ gap: 12 }}>
        {[
          [AR.totalCostLabel, `${total.toLocaleString('ar-EG')} ج.م`, 'var(--text-main)'],
          [AR.paidLabel, `${paid.toLocaleString('ar-EG')} ج.م`, 'var(--emerald-500)'],
          [AR.remainingLabel, `${rem.toLocaleString('ar-EG')} ج.م`, rem > 0 ? 'var(--rose-500)' : 'var(--emerald-500)'],
        ].map(([l, v, c]) => (
          <div key={l} style={{ textAlign: 'center', padding: '12px 8px', background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{l}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: c }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
