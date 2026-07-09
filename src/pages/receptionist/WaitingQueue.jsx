import { useEffect, useState, useCallback } from 'react'
import { patientService } from '../Patients/services/patientService'
import { getDoctorName, findDoctorById } from '../Patients/utils/getDoctorName'
import { useToast } from '../../context/ToastContext'
import { Users, RefreshCw, Hourglass, Stethoscope, Clock } from 'lucide-react'

/* ── Shared clinic signature elements (same as other dashboards) ─── */
function PulseLine({ className }) {
  return (
    <svg className={className} viewBox="0 0 600 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 40 L80 40 L100 10 L120 70 L140 40 L180 40 L200 20 L215 55 L230 40 L600 40" />
    </svg>
  )
}

function ToothIcon({ size = 24, color = '#fff', strokeWidth = 1.6 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c-2.2 0-3.8 1-5 1-1.6 0-3 1.3-3 3.4 0 2.3.7 4 1.3 6 .5 1.7.9 4.1 1.7 5.4.5.8 1 1.2 1.6 1.2.9 0 1.1-1 1.4-2.6.3-1.4.6-3 1-3 .4 0 .7 1.6 1 3 .3 1.6.5 2.6 1.4 2.6.6 0 1.1-.4 1.6-1.2.8-1.3 1.2-3.7 1.7-5.4.6-2 1.3-3.7 1.3-6C20 5.3 18.6 4 17 4c-1.2 0-2.8-1-5-1Z" />
    </svg>
  )
}

function ToothWatermark({ size = 130 }) {
  return (
    <svg className="dash-hero__tooth-watermark" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="0.7">
      <path d="M12 3c-2.2 0-3.8 1-5 1-1.6 0-3 1.3-3 3.4 0 2.3.7 4 1.3 6 .5 1.7.9 4.1 1.7 5.4.5.8 1 1.2 1.6 1.2.9 0 1.1-1 1.4-2.6.3-1.4.6-3 1-3 .4 0 .7 1.6 1 3 .3 1.6.5 2.6 1.4 2.6.6 0 1.1-.4 1.6-1.2.8-1.3 1.2-3.7 1.7-5.4.6-2 1.3-3.7 1.3-6C20 5.3 18.6 4 17 4c-1.2 0-2.8-1-5-1Z" />
    </svg>
  )
}

function Sk({ h = 28, w = '100%', r = 6 }) {
  return <div style={{ height: h, width: w, background: 'var(--border)', borderRadius: r, opacity: .5 }} />
}

function SectionHead({ icon: Icon, title, sub, action }) {
  return (
    <div className="section-head">
      <div>
        <div className="section-head__title">
          {Icon && <span className="section-head__icon"><Icon size={16} /></span>}
          {title}
        </div>
        {sub && <div className="section-head__sub">{sub}</div>}
      </div>
      {action}
    </div>
  )
}

function statusBadge(s) {
  const m = { active: 'badge-green', pending: 'badge-amber', completed: 'badge-blue', inactive: 'badge-red' }
  const ar = { active: 'نشط', pending: 'معلق', completed: 'مكتمل', inactive: 'غير نشط' }
  const k = (s || '').toLowerCase()
  return <span className={`badge ${m[k] || 'badge-blue'}`}>{ar[k] || s || '—'}</span>
}

function patientDisplayName(p) {
  return p.fullName || `${p.firstName || ''} ${p.middleName || ''} ${p.lastName || ''}`.trim() || p.name || '—'
}

function formatTime(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
}

// Same "waiting" definition used across the app (Doctor Dashboard):
// pending = next in line, active = currently being seen.
function isWaiting(p) {
  const s = (p.status || '').toLowerCase()
  return s === 'pending' || s === 'active'
}

export default function WaitingQueue() {
  const { toast } = useToast()
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [p, d] = await Promise.allSettled([
        patientService.getAll(),
        patientService.getDoctors()
      ])
      setPatients(p.status === 'fulfilled' ? p.value : [])
      setDoctors(d.status === 'fulfilled' ? d.value : [])
    } catch {
      toast('فشل تحميل البيانات', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { load() }, [load])

  // Only the patients currently waiting/in-progress — never re-sorted,
  // the original order returned by the API is preserved exactly.
  const waitingPatients = patients.filter(isWaiting)

  // Group by doctor while preserving the incoming order (first appearance
  // of a doctor determines the group's position; patients keep their order
  // inside each group).
  const groups = []
  const groupIndex = new Map()

  for (const p of waitingPatients) {
    const rawDoctor = p.doctorId
    const doctorObj = typeof rawDoctor === 'object' && rawDoctor
      ? rawDoctor
      : findDoctorById(doctors, rawDoctor)
    const doctorId = (rawDoctor && typeof rawDoctor === 'object' ? rawDoctor._id : rawDoctor) || 'unknown'
    const doctorName = getDoctorName(doctorObj) || 'بدون طبيب محدد'

    if (!groupIndex.has(doctorId)) {
      groupIndex.set(doctorId, groups.length)
      groups.push({ doctorId, doctorName, patients: [] })
    }
    groups[groupIndex.get(doctorId)].patients.push(p)
  }

  const total = waitingPatients.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="dash-hero dash-hero--violet animate-fade-up">
        <PulseLine className="dash-hero__pulse" />
        <ToothWatermark size={140} />
        <div className="dash-hero__content">
          <div className="dash-hero__badge"><ToothIcon size={24} color="#fff" /></div>
          <div>
            <div className="dash-hero__eyebrow">قائمة الانتظار</div>
            <div className="dash-hero__title">جميع المرضى المنتظرين حسب الطبيب</div>
            <div className="dash-hero__date">
              {total > 0 ? `${total} مريض في الانتظار الآن` : 'لا يوجد مرضى في الانتظار حاليًا'}
            </div>
          </div>
        </div>
        <div className="dash-hero__actions">
          <button className="btn btn-primary" onClick={load} disabled={loading}>
            <RefreshCw size={14} style={{ animation: loading ? 'spin .7s linear infinite' : 'none' }} />
            تحديث
          </button>
        </div>
      </div>

      {/* ── Total waiting ────────────────────────────────────────────── */}
      <div className="grid-4">
        <div className="vital-card animate-fade-up" style={{ '--vc-accent': 'var(--clinic-violet)', '--vc-accent-bg': 'rgba(124,58,237,.12)' }}>
          <div className="vital-card__icon"><Hourglass size={20} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {loading ? <Sk h={26} w={80} /> : <div className="vital-card__value">{total}</div>}
            <div className="vital-card__label">إجمالي المرضى المنتظرين</div>
          </div>
        </div>
        <div className="vital-card animate-fade-up" style={{ '--vc-accent': 'var(--clinic-sky)', '--vc-accent-bg': 'rgba(56,189,248,.12)' }}>
          <div className="vital-card__icon"><Stethoscope size={20} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {loading ? <Sk h={26} w={80} /> : <div className="vital-card__value">{groups.length}</div>}
            <div className="vital-card__label">عدد الأطباء لديهم مرضى منتظرين</div>
          </div>
        </div>
      </div>

      {/* ── Groups by doctor ─────────────────────────────────────────── */}
      {loading ? (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1, 2, 3].map(i => <Sk key={i} h={52} r={10} />)}
          </div>
        </div>
      ) : groups.length === 0 ? (
        <div className="card" style={{ padding: 24 }}>
          <div className="empty-state" style={{ padding: '30px 0' }}>
            <Users size={32} />
            <p>لا يوجد مرضى في قائمة الانتظار</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {groups.map(g => (
            <div className="card animate-fade-up" key={g.doctorId} style={{ padding: 24 }}>
              <SectionHead
                icon={Stethoscope}
                title={`د / ${g.doctorName}`}
                action={<span className="badge badge-violet">{g.patients.length} في الانتظار</span>}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {g.patients.map((p, i) => {
                  const pname = patientDisplayName(p)
                  const regTime = formatTime(p.visitDate || p.createdAt)
                  return (
                    <div key={p._id || i} className="mini-row" style={{ cursor: 'default' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar" style={{ width: 32, height: 32, fontSize: 12, background: 'var(--clinic-violet)' }}>
                          {pname[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>{pname}</div>
                          {regTime && (
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Clock size={11} /> {regTime}
                            </div>
                          )}
                        </div>
                      </div>
                      <div>{statusBadge(p.status)}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
