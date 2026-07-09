import { useState } from 'react'
import { AR } from '../../../utils/ar'
import { useToast } from '../../../context/ToastContext'
import Modal from '../components/Modal'
import { patientService } from '../services/patientService'

export default function PaymentModal({ patient, onClose, onSaved }) {
  const { toast } = useToast()
  const [form, setForm] = useState({ amount: '', note: '', totalCost: '', method: '' })
  const [submitting, setSubmitting] = useState(false)

  const total = Number(patient.totalCost || 0)
  const paid = Number(patient.costPaid || 0)
  const remaining = total - paid

  async function handleSubmit(ev) {
    ev.preventDefault()
    setSubmitting(true)
    try {
      const addAmount = Number(form.totalCost || 0) // زيادة على الإجمالي (لو موجودة)
      const payAmount = Number(form.amount || 0)     // الدفعة نفسها

      // 1) لو في زيادة على التوتال كوست، نبعتها أول (منفصلة تمامًا عن الدفع)
      if (addAmount > 0) {
        await patientService.increaseTotalCost(patient._id || patient.id, addAmount)
      }

      // 2) لو في مبلغ مدفوع فعلاً، نبعته كدفعة منفصلة
      if (payAmount > 0) {
        await patientService.updatePayment(patient._id || patient.id, {
          amount: payAmount,
          note: form.note,
          method: form.method,
        })
      }

      if (addAmount <= 0 && payAmount <= 0) {
        toast('من فضلك ادخل مبلغ دفعة أو زيادة في الإجمالي', 'error')
        return
      }

      toast('تم تحديث الدفع بنجاح', 'success')
      onClose()
      await onSaved()
    } catch (err) {
      toast(err.message || 'فشل تحديث الدفع', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title={`${AR.payment} — ${patient.fullName || patient.name}`} onClose={onClose} maxWidth={480}>
      <form onSubmit={handleSubmit}>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[
              ['الإجمالي', total, 'var(--text-main)'],
              ['المدفوع', paid, 'var(--emerald-500)'],
              ['المتبقي', remaining, remaining > 0 ? 'var(--rose-500)' : 'var(--emerald-500)'],
            ].map(([label, value, color]) => (
              <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color }}>{Number(value).toLocaleString('ar-EG')} ج.م</div>
              </div>
            ))}
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>زيادة الإجمالي</label>
              <input className="input-field" type="number" min="0" placeholder="0" value={form.totalCost} onChange={e => setForm(f => ({ ...f, totalCost: e.target.value }))} />
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>إضافة خدمة جديدة</div>
            </div>
            <div className="input-group">
              <label>الدفعة الحالية</label>
              <input className="input-field" type="number" min="1" placeholder="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
          </div>

          <div className="input-group">
            <label>ملاحظة</label>
            <textarea className="input-field" rows={2} placeholder="اكتب أي ملاحظة..." value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} style={{ resize: 'none', minHeight: 70 }} />
          </div>

          <div className="input-group">
            <label>{AR.paymentMethod}</label>
            <select className="input-field" value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))}>
              <option value="">{AR.selectMethod}</option>
              <option value="cash">{AR.cash}</option>
              <option value="card">{AR.card}</option>
              <option value="transfer">{AR.transfer}</option>
              <option value="insurance">{AR.insurance}</option>
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? AR.saving : AR.updatePayment}</button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>{AR.cancel}</button>
        </div>
      </form>
    </Modal>
  )
}
