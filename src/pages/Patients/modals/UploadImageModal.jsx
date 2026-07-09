import { useRef, useState } from 'react'
import { Camera, X } from 'lucide-react'
import { AR } from '../../../utils/ar'
import { useToast } from '../../../context/ToastContext'
import { patientService } from '../services/patientService'


export default function UploadImageModal({ patientId, onClose, onUploaded }) {
  console.log("uploadImage called");

  const { toast } = useToast()
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [note, setNote] = useState('')
  const [uploading, setUploading] = useState(false)

  function handlePick(e) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function handleUpload() {
    if (!file) { inputRef.current?.click(); return }

    setUploading(true)
    try {
      await patientService.uploadImage(patientId, file, note)
      toast('تم رفع الصورة', 'success')
      onUploaded()
    } catch (err) {
      toast(err.message || 'تعذر رفع الصورة، تحقق من إعداد الخادم', 'error')
    } finally {

      setUploading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>{AR.addImage}</h3>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handlePick}
          />

          {preview ? (
            <img src={preview} alt="معاينة" style={{ width: '100%', maxHeight: 260, objectFit: 'contain', borderRadius: 10, border: '1px solid var(--border)' }} />
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="btn btn-secondary"
              style={{ padding: '28px 0', flexDirection: 'column', gap: 8, border: '1.5px dashed var(--border)' }}
            >
              <Camera size={26} />
              <span>التقاط / اختيار صورة</span>
            </button>
          )}

          
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={handleUpload} disabled={uploading}>
            {uploading ? AR.uploadingImage : (file ? 'رفع الصورة' : 'اختر صورة')}
          </button>
          <button className="btn btn-ghost" onClick={onClose}>{AR.cancel}</button>
        </div>
      </div>
    </div>
  )
}
