// Backend RoleEnum: { Admin: 0, Reception: 1, Doctor: 2 }
// Role comes from GET /users response as Int32

export function normalizeRole(raw) {
  if (raw === null || raw === undefined || raw === '') return null

  // Handle array (just in case)
  if (Array.isArray(raw)) raw = raw[0]

  const n = Number(raw)
  if (!isNaN(n)) {
    if (n === 0) return 'admin'
    if (n === 1) return 'receptionist'
    if (n === 2) return 'doctor'
  }

  const s = String(raw).toLowerCase().trim()
  if (s === 'admin'       || s === '0') return 'admin'
  if (s === 'doctor'      || s === '2') return 'doctor'
  if (s === 'reception'   || s === 'receptionist' || s === '1') return 'receptionist'

  return null // unknown role
}

// JWT aud is NOT the role - just extract userId from sub
export function getUserIdFromJWT(token) {
  try {
    const p = JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))
    return p?.sub || p?.id || ''
  } catch { return '' }
}
