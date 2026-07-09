import { Stethoscope } from 'lucide-react'
import { AR } from '../../../utils/ar'
import { getDoctorName } from '../utils/getDoctorName'
import ErrMsg from './ErrMsg'

export default function DoctorSelect({ doctors, value, onChange, error }) {
  return (
    <div className="input-group">
      <label>{AR.assignedDoctor} <span style={{ color: 'var(--rose-500)' }}>*</span></label>
      <div style={{ position: 'relative' }}>
        <Stethoscope size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
        <select className="input-field" value={value} onChange={e => onChange(e.target.value)} style={{ paddingRight: 36, borderColor: error ? 'var(--rose-500)' : undefined }}>
          <option value="">{AR.selectDoctor}</option>
          {(doctors || []).map(d => (
            <option key={d._id || d.id} value={d._id || d.id}>
              {getDoctorName(d)}
              {d.specialization ? ` — ${d.specialization}` : ''}
            </option>
          ))}
        </select>
      </div>
      <ErrMsg msg={error} />
    </div>
  )
}
