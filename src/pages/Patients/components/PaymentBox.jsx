import { useState } from 'react'
import { AR } from '../../../utils/ar'
import ErrMsg from './ErrMsg'

export default function PaymentBox({ totalCost, costPaid, onTotalChange, onPaidChange, errorTotal, errorPaid }) {
  const [localTotal, setLocalTotal] = useState(String(totalCost || ''))
  const [localPaid, setLocalPaid] = useState(String(costPaid || ''))
  const rem = Number(localTotal || 0) - Number(localPaid || 0)
  return (
    <div style={{ background: 'var(--slate-50)', borderRadius: 12, padding: 16, border: '1px solid var(--border)' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>💵</span> {AR.paymentDetails}
      </div>
      <div className="grid-2">
        <div className="input-group">
          <label>{AR.totalCost} <span style={{ color: 'var(--rose-500)' }}>*</span></label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 12, pointerEvents: 'none' }}>ج.م</span>
            <input className="input-field" type="number" min="0" step="1" placeholder="5000"
              value={localTotal} onChange={e => { setLocalTotal(e.target.value); onTotalChange(e.target.value) }}
              style={{ paddingRight: 44, borderColor: errorTotal ? 'var(--rose-500)' : undefined }} />
          </div>
          <ErrMsg msg={errorTotal} />
        </div>
        <div className="input-group">
          <label>{AR.amountPaid} <span style={{ color: 'var(--rose-500)' }}>*</span></label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 12, pointerEvents: 'none' }}>ج.م</span>
            <input className="input-field" type="number" min="0" step="1" placeholder="2500"
              value={localPaid} onChange={e => { setLocalPaid(e.target.value); onPaidChange(e.target.value) }}
              style={{ paddingRight: 44, borderColor: errorPaid ? 'var(--rose-500)' : undefined }} />
          </div>
          <ErrMsg msg={errorPaid} />
        </div>
      </div>
      {localTotal !== '' && localPaid !== '' && (
        <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 8, background: rem > 0 ? '#fee2e2' : '#dcfce7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14, fontWeight: 700 }}>
          <span style={{ color: rem > 0 ? '#991b1b' : '#166534' }}>{AR.remainingBalance}</span>
          <span style={{ color: rem > 0 ? '#dc2626' : '#16a34a' }}>{rem.toLocaleString('ar-EG')} ج.م</span>
        </div>
      )}
    </div>
  )
}
