import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { usersAPI } from '../api'
import { normalizeRole } from '../utils/roles'
import {
  User, Lock, Camera, Save, Eye, EyeOff,
  Mail, Phone, Shield, Upload, RefreshCw
} from 'lucide-react'

const ROLE_LABELS = { admin: 'مدير', doctor: 'طبيب', receptionist: 'موظف استقبال' }
const ROLE_COLORS = { admin: '#f59e0b', doctor: '#14b8a6', receptionist: '#8b5cf6' }

export default function UserProfile() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const role = normalizeRole(user?.role)
  const roleColor = ROLE_COLORS[role] || '#14b8a6'
  const roleLabel = ROLE_LABELS[role] || role

  const [tab, setTab] = useState('info')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form state - initialized from user immediately (no flash of empty)
  const [name, setName] = useState(() => user?.name || '')
  const [phone, setPhone] = useState(() => user?.phone || '')

  // Password
  const [oldPwd, setOldPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)

  // Avatar / cover previews
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)

  // Load fresh profile from server on mount
  useEffect(() => {
    async function loadProfile() {
      setLoading(true)
      try {
        const res = await usersAPI.getMe()
        const pd = res?.data || res
        if (pd) {
          const fullName =
            [pd.firstName, pd.middleName, pd.lastName]
              .filter(Boolean)
              .join(' ')
            || pd.name
            || pd.userName
            || user?.name
            || ''
          setName(fullName)
          setPhone(pd.phone || user?.phone || '')
          if (pd.profilePicture?.secure_url) setAvatarPreview(pd.profilePicture?.secure_url)
          else if (user?.profilePicture?.secure_url) setAvatarPreview(user.profilePicture?.secure_url)
          if (pd.profileCoverPicture?.secure_url) { setCoverPreview(pd.profileCoverPicture.secure_url) }
          else if (user?.profileCoverPicture) {
            setCoverPreview(user.profileCoverPicture?.secure_url || user.profileCoverPicture)
          }
          // Update local user cache
          updateUser({
            name: fullName,
            phone: pd.phone || '',
            profilePicture: pd.profilePicture?.secure_url || user?.profilePicture || null,
            profileCoverPicture: pd.profileCoverPicture?.secure_url || user?.profileCoverPicture || null,
          })
        }
      } catch {
        // Fallback to cached user
        setName(user?.name || '')
        setPhone(user?.phone || '')
        if (user?.profilePicture?.secure_url) setAvatarPreview(user.profilePicture)
        if (user?.profileCoverPicture?.secure_url) setCoverPreview(user.profileCoverPicture)
      } finally { setLoading(false) }
    }
    loadProfile()
  }, [user?.name, user?.phone, user?.profilePicture, user?.profileCoverPicture])

  const initials = (name || user?.email || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  async function handleSaveInfo(e) {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await usersAPI.updateProfile({
        fullName: name,
        phone,
      })

      const data = res.data || res

      updateUser({
        name: data.fullName,
        phone: data.phone,
      })

      setName(data.fullName)
      setPhone(data.phone)

      toast('تم تحديث الملف الشخصي بنجاح', 'success')
    } catch (err) {
      toast(err.message || 'فشل التحديث', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()

    if (newPwd !== confirmPwd) {
      toast('كلمتا المرور غير متطابقتين', 'error')
      return
    }

    if (newPwd.length < 6) {
      toast('كلمة المرور قصيرة — 6 أحرف على الأقل', 'error')
      return
    }

    setSaving(true)

    try {
      await usersAPI.updatePassword({
        oldPassword: oldPwd,
        password: newPwd,
        confirmPassword: confirmPwd
      })

      toast('تم تغيير كلمة المرور بنجاح', 'success')
      setOldPwd('')
      setNewPwd('')
      setConfirmPwd('')
    } catch (err) {
      toast(err.message || 'فشل تحديث كلمة المرور', 'error')
    } finally {
      setSaving(false)
    }
  }
  async function uploadFile(file, apiCall, userKey, setPreview) {
    if (!file) return

    const preview = URL.createObjectURL(file)
    setPreview(preview)

    try {
      await apiCall(file)

      updateUser({
        [userKey]: preview
      })

      toast('تم تحديث الصورة بنجاح', 'success')
    } catch (err) {
      toast(err.message || 'فشل رفع الصورة', 'error')
    }
  }

  const TABS = [
    { id: 'info', label: 'معلومات الملف', icon: User },
    { id: 'photo', label: 'الصور', icon: Camera },
    { id: 'security', label: 'الأمان', icon: Lock },
  ]

  return (
    <div style={{ maxWidth: 720 }}>

      {/* Cover + Avatar */}
      {/* Cover + Avatar */}
      <div style={{ marginBottom: 30 }}>

        {/* Cover */}
        <div
          className="profile-cover"
          style={{
            background: coverPreview
              ? `url(${coverPreview}) center/cover`
              : `linear-gradient(135deg, ${roleColor}99, ${roleColor}44, #1e293b)`
          }}
        >
          <svg
            width="100%"
            height="100%"
            style={{
              position: 'absolute',
              inset: 0,
              opacity: .06,
              pointerEvents: 'none'
            }}
          >
            <defs>
              <pattern
                id="pp"
                x="0"
                y="0"
                width="24"
                height="24"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1.5" fill="#fff" />
              </pattern>
            </defs>

            <rect width="100%" height="100%" fill="url(#pp)" />
          </svg>
        </div>

        {/* Avatar + Name */}
        <div className="profile-avatar-wrap">
          <div
            className="profile-avatar"
            style={{ background: roleColor }}
          >
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              initials
            )}
          </div>

          <h2 className="profile-name">
            {name || user?.email?.split('@')[0] || 'User'}
          </h2>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 14px',
              borderRadius: 999,
              background: `${roleColor}18`,
              color: roleColor,
              fontSize: 13,
              fontWeight: 700
            }}
          >
            <Shield size={13} />
            {roleLabel}
          </span>
        </div>

      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontSize: 14, fontWeight: 600, transition: 'all .15s',
            display: 'flex', alignItems: 'center', gap: 6,
            background: tab === t.id ? 'var(--surface)' : 'transparent',
            color: tab === t.id ? 'var(--text-main)' : 'var(--text-muted)',
            boxShadow: tab === t.id ? 'var(--shadow-sm)' : 'none'
          }}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* INFO TAB */}
      {tab === 'info' && (
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>المعلومات الشخصية</h3>
          <form onSubmit={handleSaveInfo} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="grid-2">
              <div className="input-group">
                <label>الاسم الكامل</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <input className="input-field" placeholder="اسم المستخدم" value={name} onChange={e => setName(e.target.value)} style={{ paddingRight: 36 }} />
                </div>
              </div>
              <div className="input-group">
                <label>رقم الهاتف</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <input className="input-field" placeholder="+20 1xx xxx xxxx" value={phone} onChange={e => setPhone(e.target.value)} style={{ paddingRight: 36 }} />
                </div>
              </div>
            </div>
            <div className="input-group">
              <label>البريد الإلكتروني <span style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 400 }}>(لا يمكن تغييره)</span></label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input className="input-field" value={user?.email || ''} readOnly style={{ paddingRight: 36, background: 'var(--slate-50)', color: 'var(--text-muted)', cursor: 'not-allowed' }} />
              </div>
            </div>
            <div style={{ padding: '14px 16px', borderRadius: 'var(--radius-md)', background: `${roleColor}0d`, border: `1px solid ${roleColor}33`, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Shield size={18} color={roleColor} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>دورك: {roleLabel}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>يتم إدارة صلاحيات الدور بواسطة مدير النظام</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={15} /> {saving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
              </button>
            </div>
          </form>
        </div>
      )}


      {/* PHOTOS TAB */}
      {tab === 'photo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Profile Picture */}
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
              صورة الملف الشخصي
            </h3>

            <p
              style={{
                fontSize: 13,
                color: 'var(--text-muted)',
                marginBottom: 24
              }}
            >
              تظهر في الشريط الجانبي وعلى ملفك الشخصي.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                flexWrap: 'wrap'
              }}
            >
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  background: roleColor,
                  border: '3px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  fontWeight: 800,
                  color: '#fff',
                  overflow: 'hidden',
                  flexShrink: 0
                }}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt=""
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  initials
                )}
              </div>

              <label className="btn btn-primary">
                <Upload size={15} />
                تغيير الصورة الشخصية

                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e =>
                    uploadFile(
                      e.target.files?.[0],
                      usersAPI.updateProfilePic,
                      'profilePicture',
                      setAvatarPreview
                    )
                  }
                />
              </label>
            </div>
          </div>

          {/* Cover Picture */}
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
              صورة الغلاف
            </h3>

            <p
              style={{
                fontSize: 13,
                color: 'var(--text-muted)',
                marginBottom: 20
              }}
            >
              الصورة التي تظهر في أعلى ملفك الشخصي.
            </p>

            <div
              style={{
                height: 120,
                borderRadius: 'var(--radius-lg)',
                marginBottom: 16,
                background: coverPreview
                  ? `url(${coverPreview}) center/cover`
                  : `linear-gradient(135deg, ${roleColor}88, #1e293b)`,
                border: '1px solid var(--border)'
              }}
            />

            <label className="btn btn-primary">
              <Camera size={15} />
              تغيير الغلاف

              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e =>
                  uploadFile(
                    e.target.files?.[0],
                    usersAPI.updateCoverPic,
                    'profileCoverPicture',
                    setCoverPreview
                  )
                }
              />
            </label>
          </div>

        </div>
      )}

      {/* SECURITY TAB */}
      {
        tab === 'security' && (
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>تغيير كلمة المرور</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>6 أحرف على الأقل.</p>
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div className="input-group">
                <label>كلمة المرور الحالية</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <input className="input-field" type={showOld ? 'text' : 'password'} placeholder="••••••••" value={oldPwd} onChange={e => setOldPwd(e.target.value)} required style={{ paddingRight: 36, paddingLeft: 44 }} />
                  <button type="button" onClick={() => setShowOld(s => !s)} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    {showOld ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div style={{ height: 1, background: 'var(--border)' }} />
              <div className="input-group">
                <label>كلمة المرور الجديدة</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <input className="input-field" type={showNew ? 'text' : 'password'} placeholder="••••••••" value={newPwd} onChange={e => setNewPwd(e.target.value)} required style={{ paddingRight: 36, paddingLeft: 44 }} />
                  <button type="button" onClick={() => setShowNew(s => !s)} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {newPwd.length > 0 && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ height: 4, borderRadius: 99, background: 'var(--border)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: 99, transition: 'width .3s', width: `${Math.min(100, (newPwd.length / 12) * 100)}%`, background: newPwd.length < 6 ? '#f43f5e' : newPwd.length < 10 ? '#f59e0b' : '#10b981' }} />
                    </div>
                    <div style={{ fontSize: 11, marginTop: 4, fontWeight: 600, color: newPwd.length < 6 ? '#f43f5e' : newPwd.length < 10 ? '#d97706' : '#059669' }}>
                      {newPwd.length < 6 ? 'قصيرة جداً' : newPwd.length < 10 ? 'متوسطة' : 'قوية'}
                    </div>
                  </div>
                )}
              </div>
              <div className="input-group">
                <label>تأكيد كلمة المرور الجديدة</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <input className="input-field" type="password" placeholder="••••••••" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} required style={{ paddingRight: 36, borderColor: confirmPwd && confirmPwd !== newPwd ? '#f43f5e' : undefined }} />
                </div>
                {confirmPwd && confirmPwd !== newPwd && <div style={{ fontSize: 12, color: '#f43f5e', marginTop: 4, fontWeight: 500 }}>كلمتا المرور غير متطابقتين</div>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" disabled={saving || (!!confirmPwd && confirmPwd !== newPwd)}>
                  <Lock size={15} /> {saving ? 'جارٍ التحديث...' : 'تحديث كلمة المرور'}
                </button>
              </div>
            </form>
          </div>
        )
      }
    </div >
  )
}
