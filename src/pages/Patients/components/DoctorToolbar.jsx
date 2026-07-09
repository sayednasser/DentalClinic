import { Stethoscope, Pill, Camera, CalendarPlus, RefreshCw } from 'lucide-react'

// Shown ONLY when role === 'doctor' inside PatientDetails. Every doctor
// clinical action now lives here instead of the patients table row.
export default function DoctorToolbar({ onDiagnosis, onTreatment, onAddImage, onAddAppointment, onReschedule }) {
  return (
    <div className="card patient-toolbar-row" style={{ display: 'flex', flexWrap: 'wrap' }}>
      <button className="btn btn-secondary" onClick={onDiagnosis}><Stethoscope size={14} /> تشخيص</button>
      <button className="btn btn-secondary" onClick={onTreatment}><Pill size={14} /> خطة العلاج</button>
      <button className="btn btn-secondary" onClick={onAddImage}><Camera size={14} /> إضافة صورة</button>
      <button className="btn btn-secondary" onClick={onAddAppointment}><CalendarPlus size={14} /> إضافة موعد</button>
      {onReschedule && (
        <button className="btn btn-secondary" onClick={onReschedule}><RefreshCw size={14} /> إعادة جدولة</button>
      )}
    </div>
  )
}
