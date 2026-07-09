import { useEffect, useState, useCallback } from 'react'
import { adminAPI } from '../../api'
import { useToast } from '../../context/ToastContext'
import {
  UserPlus, X, Stethoscope, User, Mail, Lock,
  Phone, Search, Hash, Award, Users, Trash2, RefreshCw, Clock, CalendarClock
} from 'lucide-react'

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h3>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Field({ label, icon: Icon, children, required, error }) {
  return (
    <div className="input-group">
      <label>{label}{required && <span style={{ color: 'var(--rose-500)', marginLeft: 3 }}>*</span>}</label>
      <div style={{ position: 'relative' }}>
        {Icon && <Icon size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />}
        {children}
      </div>
      {error && <div style={{ fontSize: 11, color: 'var(--rose-500)', marginTop: 4, fontWeight: 500 }}>{error}</div>}
    </div>
  )
}

const SPECS = ['طب الأسنان العام', 'تقويم الأسنان', 'علاج الجذور', 'أمراض اللثة', 'تركيبات الأسنان', 'جراحة الفم', 'طب أسنان الأطفال', 'تجميل الأسنان']
const ROLE_DOCTOR = 2, ROLE_RECEPTION = 1

const DAYS = [
  { key: 'saturday', label: 'السبت' },
  { key: 'sunday', label: 'الأحد' },
  { key: 'monday', label: 'الاثنين' },
  { key: 'tuesday', label: 'الثلاثاء' },
  { key: 'wednesday', label: 'الأربعاء' },
  { key: 'thursday', label: 'الخميس' },
  { key: 'friday', label: 'الجمعة' },
]
const DEFAULT_FROM = '09:00', DEFAULT_TO = '17:00'
function emptySchedule() {
  return DAYS.reduce((acc, d) => ({ ...acc, [d.key]: { enabled: false, from: DEFAULT_FROM, to: DEFAULT_TO } }), {})
}

const ROLE_NUM = { 0: 'مدير', 1: 'موظف استقبال', 2: 'طبيب' }
const ROLE_BADGE = { 0: 'badge-amber', 1: 'badge-violet', 2: 'badge-teal' }
const ROLE_CLR = { 0: '#f59e0b', 1: '#8b5cf6', 2: '#14b8a6' }

export default function AdminStaff({ mode = 'all' }) {
  const { toast } = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [search, setSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [deleting, setDeleting] = useState(null)
  const [scheduleDoctor, setScheduleDoctor] = useState(null)
  const [scheduleForm, setScheduleForm] = useState(emptySchedule())
  const [savingSchedule, setSavingSchedule] = useState(false)

  const [dForm, setDForm] = useState({ fullName: '', email: '', password: '', phone: '', specialization: '', age: '' })
  const [rForm, setRForm] = useState({ fullName: '', email: '', password: '', phone: '', age: '' })
  const setD = (k, v) => { setDForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }
  const setR = (k, v) => { setRForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })) }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const d = await adminAPI.getUsers()
      setUsers(Array.isArray(d) ? d : d?.data || [])
    } catch { toast('فشل تحميل الموظفين', 'error') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [])

  function validateDoctor() {
    const e = {}
    if (!dForm.fullName.trim()) e.fullName = 'مطلوب'
    if (!dForm.email.trim()) e.email = 'مطلوب'
    if (!dForm.password || dForm.password.length < 6) e.password = '6 أحرف على الأقل'
    if (!dForm.phone.trim()) e.phone = 'مطلوب'
    if (!dForm.specialization) e.specialization = 'مطلوب'
    if (!dForm.age) e.age = 'مطلوب'
    return e
  }
  function validateReception() {
    const e = {}
    if (!rForm.fullName.trim()) e.fullName = 'مطلوب'
    if (!rForm.email.trim()) e.email = 'مطلوب'
    if (!rForm.password || rForm.password.length < 6) e.password = '8 أحرف على الأقل'
    return e
  }

  async function handleCreateDoctor(ev) {
    ev.preventDefault()
    const e = validateDoctor()
    if (Object.keys(e).length) { setErrors(e); return }
    setSubmitting(true)
    try {
      await adminAPI.createDoctor({ ...dForm, age: Number(dForm.age), role: ROLE_DOCTOR })
      toast(' انشاء طبيب ', 'نجاح')
      setModal(null)
      setDForm({ fullName: '', email: '', password: '', phone: '', specialization: '', age: '' })
      setErrors({})
      load()
    } catch (err) { toast(err.message || 'فشل', 'error') }
    finally { setSubmitting(false) }
  }

  async function handleCreateReception(ev) {
    ev.preventDefault()
    const e = validateReception()
    if (Object.keys(e).length) { setErrors(e); return }

    setSubmitting(true)
    try {
      await adminAPI.createReception({ ...rForm, age: rForm.age ? Number(rForm.age) : undefined, role: ROLE_RECEPTION })
      toast('موظف استقبال ', 'success')
      setModal(null)
      setRForm({ fullName: '', email: '', password: '', phone: '', age: '' })
      setErrors({})
      load()
    } catch (err) { toast(err.message || 'فشل', 'error') }
    finally { setSubmitting(false) }
  }

  async function handleDelete(u) {
    const name = u.fullName || u.name || u.email

    if (!confirm(`حذف ${name} ؟`)) return

    setDeleting(u._id || u.id)

    try {
      await adminAPI.deleteUser(u._id || u.id)

      toast('تم الحذف بنجاح', 'success')
      load()
    } catch (err) {
      toast(err.message || 'فشل الحذف', 'error')
    } finally {
      setDeleting(null)
    }
  }
  function openSchedule(u) {
    const base = emptySchedule()
    const existing = u.workingHours || []

    existing.forEach(e => {
      base[e.day] = {
        enabled: true,
        from: e.from || DEFAULT_FROM,
        to: e.to || DEFAULT_TO
      }
    })

    setScheduleForm(base)
    setScheduleDoctor(u)
  }

  function toggleDay(key) {
    setScheduleForm(f => ({ ...f, [key]: { ...f[key], enabled: !f[key].enabled } }))
  }

  function setDayTime(key, field, value) {
    setScheduleForm(f => ({ ...f, [key]: { ...f[key], [field]: value } }))
  }

async function handleSaveSchedule() {
 const workingHours = DAYS
  .filter(d => scheduleForm[d.key].enabled)
  .map(d => ({
    day: d.key.charAt(0).toUpperCase() + d.key.slice(1),
    startTime: scheduleForm[d.key].from,
    endTime: scheduleForm[d.key].to
  }))

  console.log("SEND DATA:", {
    workingHours
  })

  try {
    const doctorId = scheduleDoctor._id || scheduleDoctor.id

    await adminAPI.updateWorkingHours(doctorId, workingHours)

    toast('تم حفظ مواعيد العمل بنجاح', 'success')
    setScheduleDoctor(null)
    load()

  } catch (err) {
    console.log(err)
    toast(err.message || 'فشل حفظ المواعيد', 'error')
  }
}

  const filtered = users.filter(u => {
    const name = (
      u.fullName ||
      [u.firstName, u.middleName, u.lastName]
        .filter(Boolean)
        .join(" ") ||
      u.name ||
      u.email ||
      ""
    ).toLowerCase()
    const match = name.includes(search.toLowerCase())

    const rNum = Number(u.role)

    if (mode === 'doctors') return match && rNum === 2
    if (mode === 'staff') return match && rNum === 1

    return match && rNum !== 0
  })
  const iS = (key, pl = 36) => ({ paddingLeft: pl, borderColor: errors[key] ? 'var(--rose-500)' : undefined })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input-field" placeholder={`Search ${mode === 'doctors' ? 'doctors' : 'receptionists'}…`} value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
          </div>
          <button className="btn btn-ghost" onClick={load} disabled={loading}>
            <RefreshCw size={14} style={{ animation: loading ? 'spin .7s linear infinite' : 'none' }} /> تحديث
          </button>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {(mode === 'all' || mode === 'staff') && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setErrors({})
                setModal('receptionist')
              }}
            >
              <UserPlus size={14} />
              إضافة موظف استقبال
            </button>
          )}
          {(mode === 'all' || mode === 'doctors') && (
            <button className="btn btn-primary" onClick={() => { setErrors({}); setModal('doctor') }}>
              <Stethoscope size={15} /> إضافة طبيب
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><Users size={40} /><h3>No {mode === 'doctors' ? 'doctors' : 'receptionists'} found</h3></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>الاسم</th><th>البريد الإلكتروني</th><th>الدور</th>
                  <th>الهاتف</th><th>التخصص</th><th>العمر</th><th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => {
                  const name =
                    u.fullName ||
                    [u.firstName, u.middleName, u.lastName]
                      .filter(Boolean)
                      .join(" ") ||
                    u.name ||
                    "—"
                  const rNum = Number(u.role)
                  const pid = u._id || u.id
                  return (
                    <tr key={pid || i}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar" style={{ width: 34, height: 34, fontSize: 13, background: ROLE_CLR[rNum] || 'var(--teal-600)', flexShrink: 0 }}>
                            {(name[0] || '?').toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14 }}>{name}</div>
                            {u.firstName && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}></div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{u.email}</td>
                      <td><span className={`badge ${ROLE_BADGE[rNum] || 'badge-blue'}`}>{ROLE_NUM[rNum] || `Role ${u.role}`}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{u.phone || '—'}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{u.specialization || '—'}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{u.age || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {rNum === 2 && (
                            <button
                              className="icon-btn"
                              title="مواعيد العمل"
                              onClick={() => openSchedule(u)}
                              style={{ color: 'var(--teal-600)' }}
                            >
                              <CalendarClock size={14} />
                            </button>
                          )}
                          <button
                            className="icon-btn"
                            title="Delete"
                            disabled={deleting === pid}
                            onClick={() => handleDelete(u)}
                            style={{ color: 'var(--rose-500)' }}
                          >
                            {deleting === pid ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : <Trash2 size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* إضافة طبيب Modal */}
      {modal === 'doctor' && (
        <Modal title="إضافة طبيب جديد" onClose={() => setModal(null)}>
          <form onSubmit={handleCreateDoctor}>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="grid-2">
                <Field label="الاسم الكامل" icon={User} required error={errors.fullName}>
                  <input className="input-field" placeholder="د. أحمد حسن" value={dForm.fullName} onChange={e => setD('fullName', e.target.value)} style={iS('fullName')} />
                </Field>
                <Field label="السن" icon={Hash} required error={errors.age}>
                  <input className="input-field" type="number" min="18" max="80" placeholder="35" value={dForm.age} onChange={e => setD('age', e.target.value)} style={iS('age')} />
                </Field>
              </div>
              <div className="grid-2">
                <Field label="البريد الإلكتروني" icon={Mail} required error={errors.email}>
                  <input className="input-field" type="email" placeholder="doctor@clinic.com" value={dForm.email} onChange={e => setD('email', e.target.value)} style={iS('email')} />
                </Field>
                <Field label="الهاتف" icon={Phone} required error={errors.Phone}>
                  <input className="input-field" placeholder="+201xxxxxxxxx" value={dForm.Phone} onChange={e => setD('phone', e.target.value)} style={iS('phone')} />
                </Field>
              </div>
              <Field label="كلمة المرور" icon={Lock} required error={errors.password}>
                <input className="input-field" type="password" placeholder="6 أحرف على الأقل" value={dForm.password} onChange={e => setD('password', e.target.value)} style={iS('password')} />
              </Field>
              <div className="input-group">
                <label>التخصص <span style={{ color: 'var(--rose-500)' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <Award size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <select className="input-field" value={dForm.specialization} onChange={e => setD('specialization', e.target.value)} style={{ paddingLeft: 36, borderColor: errors.specialization ? 'var(--rose-500)' : undefined }}>
                    <option value="">اختر التخصص...</option>
                    {SPECS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {errors.specialization && <div style={{ fontSize: 11, color: 'var(--rose-500)', marginTop: 4 }}>{errors.specialization}</div>}
              </div>
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--teal-50)', border: '1px solid var(--teal-100)', fontSize: 13, color: 'var(--teal-700)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Stethoscope size={14} /> سيتم تعيين الدور: <strong>طبيب</strong> (رقم الدور: {ROLE_DOCTOR})
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>إلغاء</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'جارٍ الإنشاء...' : 'إنشاء طبيب'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* إضافة موظف استقبال Modal */}
      {modal === 'receptionist' && (
        <Modal title="إضافة موظف استقبال جديد" onClose={() => setModal(null)}>
          <form onSubmit={handleCreateReception}>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="grid-2">
                <Field label="اسم المستخدم" icon={User} required error={errors.fullName}>
                  <input className="input-field" placeholder="sara_ahmed" value={rForm.fullName} onChange={e => setR('fullName', e.target.value)} style={iS('fullName')} />
                </Field>
                <Field label="السن" icon={Hash}>
                  <input className="input-field" type="number" min="18" max="65" placeholder="25" value={rForm.age} onChange={e => setR('age', e.target.value)} style={{ paddingLeft: 36 }} />
                </Field>
              </div>
              <div className="grid-2">
                <Field label="البريد الإلكتروني" icon={Mail} required error={errors.email}>
                  <input className="input-field" type="email" placeholder="reception@clinic.com" value={rForm.email} onChange={e => setR('email', e.target.value)} style={iS('email')} />
                </Field>
                <Field label="الهاتف" icon={Phone}>
                  <input className="input-field" placeholder="+201xxxxxxxxx" value={rForm.phone} onChange={e => setR('phone', e.target.value)} />
                </Field>
              </div>
              <Field label="كلمة المرور" icon={Lock} required error={errors.password}>
                <input className="input-field" type="password" placeholder="8 أحرف على الأقل" value={rForm.password} onChange={e => setR('password', e.target.value)} style={iS('password')} />
              </Field>
              <div style={{ padding: '10px 14px', borderRadius: 8, background: '#ede9fe', border: '1px solid #ddd6fe', fontSize: 13, color: '#6d28d9', display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserPlus size={14} /> سيتم تعيين الدور: <strong>موظف استقبال</strong> (رقم الدور: {ROLE_RECEPTION})
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>إلغاء</button>
              <button type="submit" className="btn btn-primary" disabled={submitting} style={{ background: '#7c3aed' }}>{submitting ? 'جارٍ الإنشاء...' : 'انشاء موظف استقبال'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* مواعيد عمل الطبيب Modal */}
      {scheduleDoctor && (
        <Modal
          title={`مواعيد عمل ${scheduleDoctor.fullName || scheduleDoctor.name || scheduleDoctor.email}`}
          onClose={() => setScheduleDoctor(null)}
        >
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 2 }}>
              اختر أيام العمل وحدد وقت البداية والنهاية لكل يوم
            </div>
            {DAYS.map(d => {
              const day = scheduleForm[d.key]
              return (
                <div
                  key={d.key}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', borderRadius: 8,
                    border: '1px solid var(--border-color, #e5e7eb)',
                    background: day.enabled ? 'var(--teal-50)' : 'transparent',
                  }}
                >
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 110, cursor: 'pointer', fontWeight: 600, fontSize: 13.5 }}>
                    <input type="checkbox" checked={day.enabled} onChange={() => toggleDay(d.key)} />
                    {d.label}
                  </label>
                  {day.enabled ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <Clock size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        <input
                          type="time"
                          className="input-field"
                          value={day.from}
                          onChange={e => setDayTime(d.key, 'from', e.target.value)}
                          style={{ paddingLeft: 30 }}
                        />
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>إلى</span>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <Clock size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                        <input
                          type="time"
                          className="input-field"
                          value={day.to}
                          onChange={e => setDayTime(d.key, 'to', e.target.value)}
                          style={{ paddingLeft: 30 }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>إجازة</span>
                  )}
                </div>
              )
            })}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={() => setScheduleDoctor(null)}>إلغاء</button>
            <button type="button" className="btn btn-primary" disabled={savingSchedule} onClick={handleSaveSchedule}>
              {savingSchedule ? 'جارٍ الحفظ...' : 'حفظ المواعيد'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
