import { AR } from '../../../utils/ar'
import ErrMsg from './ErrMsg'

export default function GenderToggle({ value, onChange, error }) {
  return (
    <div className="input-group">
      <label>{AR.gender} <span style={{ color: 'var(--rose-500)' }}>*</span></label>
      <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
        {[['male', AR.male, '♂'], ['female', AR.female, '♀']].map(([g, label, sym]) => (
          <button key={g} type="button" onClick={() => onChange(g)} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: '1.5px solid', borderColor: value === g ? 'var(--teal-500)' : error ? 'var(--rose-500)' : 'var(--border)', background: value === g ? 'var(--teal-50)' : 'var(--surface)', color: value === g ? 'var(--teal-700)' : 'var(--text-muted)', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all .15s', fontFamily: 'Cairo,sans-serif' }}>
            {sym} {label}
          </button>
        ))}
      </div>
      <ErrMsg msg={error} />
    </div>
  )
}
