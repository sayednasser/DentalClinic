import { useEffect, useState } from 'react'
import { Images, Trash2, X, User, Calendar } from 'lucide-react'
import { AR } from '../../../utils/ar'
import { useToast } from '../../../context/ToastContext'
import { patientService } from '../services/patientService'
export default function PatientImagesCard({ patientId, canDelete = false, refreshKey = 0 }) {
  const { toast } = useToast()
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    if (!patientId) return
    let alive = true
    setLoading(true)
    patientService.getImages(patientId)
      .then(list => {
        if (!alive) return
        const sorted = [...list].sort((a, b) => new Date(b.uploadDate || b.createdAt || 0) - new Date(a.uploadDate || a.createdAt || 0))
        setImages(sorted)
      })
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [patientId, refreshKey])

  async function handleDelete(img) {
    if (!confirm('حذف هذه الصورة؟')) return
    try {
      await patientService.deleteImage(patientId, img._id || img.id)
      toast('تم حذف الصورة', 'success')
      setImages(prev => prev.filter(i => (i._id || i.id) !== (img._id || img.id)))
    } catch (err) {
      toast(err.message || 'تعذر حذف الصورة', 'error')
    }
  }

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Images size={14} /> {AR.imagesCard}
      </div>

      {loading ? (
        <div className="loading-center" style={{ padding: 12 }}><div className="spinner" /></div>
      ) : images.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>{AR.noImages}</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
          {images.map((img, i) => (
            <div key={img._id || img.id || i} style={{ position: 'relative', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', background: 'var(--surface)' }}>
              <button
                onClick={() => setPreview(img)}
                style={{ padding: 0, border: 'none', cursor: 'pointer', background: 'none', display: 'block', width: '100%' }}
              >
                <img src={img.secure_url || img.url || img} alt={img.caption || img.note || 'صورة طبية'} style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }} />
              </button>
              <div style={{ padding: '6px 8px', fontSize: 10.5, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {(img.uploadDate || img.createdAt) && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={11} /> {new Date(img.uploadDate || img.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                )}
                {(img.uploadedBy?.fullName || img.uploadedBy?.name || img.uploadedByName) && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <User size={11} /> {img.uploadedBy?.fullName || img.uploadedBy?.name || img.uploadedByName}
                  </span>
                )}
                {(img.caption || img.note) && <span style={{ color: 'var(--text-main)' }}>{img.caption || img.note}</span>}
              </div>
              {canDelete && (
                <button
                  className="icon-btn"
                  title={AR.deleteImage}
                  style={{ position: 'absolute', top: 4, left: 4, background: 'var(--surface)', color: 'var(--rose-500)' }}
                  onClick={() => handleDelete(img)}
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {preview && (
        <div className="modal-overlay" onClick={() => setPreview(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <img
              src={preview.secure_url || preview.url || preview}
              alt={preview.caption || preview.note || 'صورة طبية'}
              style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: 10, objectFit: 'contain' }}
            />
            <button className="icon-btn" onClick={() => setPreview(null)} style={{ background: 'var(--surface)' }}><X size={16} /></button>
          </div>
        </div>
      )}
    </div>
  )
}
