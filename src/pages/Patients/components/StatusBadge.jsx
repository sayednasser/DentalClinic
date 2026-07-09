import { AR } from '../../../utils/ar'

export const STATUS_OPTIONS = ['active', 'pending', 'completed', 'inactive']
export const STATUS_AR = { active: AR.active, pending: AR.pending, completed: AR.completed, inactive: AR.inactive }

export default function StatusBadge({ status }) {
  const m = { active: 'badge-green', pending: 'badge-amber', completed: 'badge-blue', inactive: 'badge-red' }
  const key = (status || '').toLowerCase()
  return <span className={`badge ${m[key] || 'badge-blue'}`}>{STATUS_AR[key] || status || '—'}</span>
}
