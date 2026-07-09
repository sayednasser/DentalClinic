import { X } from 'lucide-react'

export default function Modal({ title, onClose, children, maxWidth = 560 }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth }}>
        <div className="modal-header">
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h3>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}
