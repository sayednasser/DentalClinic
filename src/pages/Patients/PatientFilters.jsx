import { Search, RefreshCw, UserPlus } from 'lucide-react'
import { AR } from '../../utils/ar'

export default function PatientFilters({ search, onSearchChange, onRefresh, loading, canCreate, onCreate }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', gap: 10, flex: 1, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input-field"
            placeholder={AR.searchPatients}
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            style={{ paddingRight: 36 }}
          />
        </div>
        <button className="btn btn-ghost" onClick={onRefresh} disabled={loading} style={{ gap: 6 }}>
          <RefreshCw size={14} style={{ animation: loading ? 'spin .7s linear infinite' : 'none' }} /> {AR.refresh}
        </button>
      </div>
      {canCreate && (
        <button className="btn btn-primary" onClick={onCreate}>
          <UserPlus size={15} /> {AR.newPatient}
        </button>
      )}
    </div>
  )
}
