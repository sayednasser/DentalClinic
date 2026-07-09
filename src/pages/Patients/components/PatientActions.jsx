import { AR } from '../../../utils/ar'

export default function PatientActions({ canEdit, onEdit, onClose }) {
  return (
    <div className="modal-footer">
      {canEdit && <button className="btn btn-primary" onClick={onEdit}>{AR.edit}</button>}
      <button className="btn btn-ghost" onClick={onClose}>{AR.close}</button>
    </div>
  )
}
