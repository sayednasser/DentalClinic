import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, usersAPI } from '../api'
import { normalizeRole, getUserIdFromJWT } from '../utils/roles'

const AuthContext = createContext(null)

// Keys used in localStorage
const KEYS = {
  token: 'accessToken',
  refresh: 'refreshToken',
  user: 'user',
}

function saveUser(u) {
  localStorage.setItem(KEYS.user, JSON.stringify(u))
}

function clearAuth() {
  localStorage.removeItem(KEYS.token)
  localStorage.removeItem(KEYS.refresh)
  localStorage.removeItem(KEYS.user)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // ── On mount: restore from localStorage + re-fetch profile ──────
  useEffect(() => {
    async function restore() {
      const token = localStorage.getItem(KEYS.token)
      const saved = localStorage.getItem(KEYS.user)

      if (!token) { setLoading(false); return }

      // Start with cached data immediately (fast)
      if (saved) {
        try {
          const cached = JSON.parse(saved)
          setUser(cached)
        } catch { }
      }

      // Then re-fetch from server to get fresh data (including role)
      try {
        const res = await usersAPI.getMe()
        const pd = res?.data || res
        if (pd && pd.role !== undefined) {
          const fresh = buildUser(pd, token)
          saveUser(fresh)
          setUser(fresh)
        }
      } catch {
        // Server unreachable - use cached data, don't logout
      } finally {
        setLoading(false)
      }
    }
    restore()
  }, [])

  // ── Build normalized user object ─────────────────────────────────
  function buildUser(profileData, token) {
    const rawRole = profileData?.role  // This is Int32 from DB: 0, 1, or 2
    const role = normalizeRole(rawRole)
    const userId = profileData?._id || profileData?.id || getUserIdFromJWT(token)

    return {
      id: userId,
      role,
      email: profileData?.email || '',
      name:
        profileData?.fullName ||
        [
          profileData?.firstName,
          profileData?.middleName,
          profileData?.lastName
        ]
          .filter(Boolean)
          .join(' ') ||
        profileData?.name ||
        profileData?.userName ||
        '',

      phone: profileData?.phone || '',
      gender: profileData?.gender || '',
      profilePicture:
        profileData?.profilePicture?.secure_url ||
        profileData?.profilePicture ||
        null,

      profileCoverPicture:
        profileData?.profileCoverPicture?.secure_url ||
        profileData?.profileCoverPicture ||
        null,
      specialization: profileData?.specialization || '',
    }
  }

  // ── Login ─────────────────────────────────────────────────────────
  async function login(email, password) {
    const res = await authAPI.login({ email, password })
    const accessToken = res?.data?.accessToken
    const refreshToken = res?.data?.RefreshToken || res?.data?.refreshToken

    if (!accessToken) throw new Error('No access token received')

    localStorage.setItem(KEYS.token, accessToken)
    localStorage.setItem(KEYS.refresh, refreshToken || '')

    // MUST fetch /users to get actual role from DB
    const profileRes = await usersAPI.getMe()
    const pd = profileRes?.data || profileRes
    console.log('LOGIN PROFILE', pd)

    if (!pd || pd.role === undefined) {
      throw new Error('Could not load user profile after login')
    }

    const u = buildUser(pd, accessToken)
    saveUser(u)
    setUser(u)
    return u
  }

  // ── Logout ────────────────────────────────────────────────────────
  async function logout() {
    try { await usersAPI.logout() } catch { }
    clearAuth()
    setUser(null)
  }

  // ── Update local user state + localStorage ────────────────────────
  function updateUser(updates) {
    const updated = { ...user, ...updates }
    saveUser(updated)
    setUser(updated)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
