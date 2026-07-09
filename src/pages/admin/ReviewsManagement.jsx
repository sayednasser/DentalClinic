import { useEffect, useState, useCallback } from 'react'
import { reviewsAPI } from '../../api'
import { useToast } from '../../context/ToastContext'
import { Star, Check, Trash2 } from 'lucide-react'

function isApproved(r) {
  return r.status ? r.status === 'approved' : r.approved === true
}

export default function ReviewsManagement() {
  const { toast } = useToast()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await reviewsAPI.getAdmin()
      setReviews(Array.isArray(res) ? res : res?.data || [])
    } catch {
      toast('فشل تحميل التقييمات', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  async function handleApprove(review) {
    const id = review._id || review.id
    if (busyId) return
    setBusyId(id)
    try {
      await reviewsAPI.approve(id)
      toast('تمت الموافقة على التقييم', 'success')
      await load()
    } catch {
      toast('فشلت الموافقة على التقييم', 'error')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete(review) {
    const id = review._id || review.id
    if (busyId) return
    if (!window.confirm('هل أنت متأكد من حذف هذا التقييم؟')) return
    setBusyId(id)
    try {
      await reviewsAPI.delete(id)
      toast('تم حذف التقييم', 'success')
      await load()
    } catch {
      toast('فشل حذف التقييم', 'error')
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return (
    <div className="loading-center" style={{ minHeight: '60vh' }}>
      <div className="spinner" />
      <span>جارٍ التحميل...</span>
    </div>
  )

  return (
    <div className="card" style={{ padding: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>التقييمات</h3>

      {reviews.length === 0 ? (
        <div className="empty-state"><p>لا توجد تقييمات</p></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>الاسم</th>
                <th>التقييم</th>
                <th>التعليق</th>
                <th>تاريخ الإرسال</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r, i) => {
                const approved = isApproved(r)
                const id = r._id || r.id || i
                return (
                  <tr key={id}>
                    <td><strong>{r.name || '—'}</strong></td>
                    <td>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {Array.from({ length: Number(r.rating) || 0 }).map((_, j) => (
                          <Star key={j} size={13} fill="#f59e0b" color="#f59e0b" />
                        ))}
                      </div>
                    </td>
                    <td style={{ maxWidth: 320 }}>{r.comment || '—'}</td>
                    <td>{r.createdAt ? new Date(r.createdAt).toLocaleDateString('ar-EG') : '—'}</td>
                    <td>
                      <span className={`badge ${approved ? 'badge-green' : 'badge-amber'}`}>
                        {approved ? 'موافق عليه' : 'قيد المراجعة'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {!approved && (
                          <button
                            className="btn btn-primary"
                            style={{ padding: '6px 12px', fontSize: 12 }}
                            disabled={busyId === id}
                            onClick={() => handleApprove(r)}
                          >
                            <Check size={13} /> موافقة
                          </button>
                        )}
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '6px 12px', fontSize: 12 }}
                          disabled={busyId === id}
                          onClick={() => handleDelete(r)}
                        >
                          <Trash2 size={13} /> حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
