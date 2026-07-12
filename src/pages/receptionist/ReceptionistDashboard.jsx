import { useEffect, useState, useCallback } from 'react'
import { patientsAPI } from '../../api'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { Users, Clock, CheckCircle, DollarSign, UserPlus, ArrowRight, AlertCircle, RefreshCw, Sun, CalendarDays } from 'lucide-react'
import {
  todayBounds,
  monthBounds,
  calcDebt, calcRevenue,
  DOCTOR_SHARE_PERCENT
} from '../../utils/finance'

/* ── Shared clinic signature elements ───────────────────────────── */
function PulseLine({ className }) {
  return (
    <svg className={className} viewBox="0 0 600 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 40 L80 40 L100 10 L120 70 L140 40 L180 40 L200 20 L215 55 L230 40 L600 40" />
    </svg>
  )
}

function ToothIcon({ size = 20, color = 'currentColor', strokeWidth = 1.6 }) {
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

function VitalCard({ icon: Icon, accent, accentBg, value, label, sub, loading }) {
  return (
    <div className="vital-card animate-fade-up" style={{ '--vc-accent': accent, '--vc-accent-bg': accentBg }}>
      <div className="vital-card__icon"><Icon size={20} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {loading ? <Sk h={26} w={80} /> : <div className="vital-card__value">{value ?? '0'}</div>}
        <div className="vital-card__label">{label}</div>
        {sub && !loading && <div className="vital-card__sub">{sub}</div>}
      </div>
    </div>
  )
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

export default function ReceptionistDashboard({ onNavigate }) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    patientsAPI.getAll()
      .then(d => setPatients(d?.data?.patients || []))
      .catch(() => toast('فشل تحميل البيانات', 'error'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [])
  const { start: ts, end: te } = todayBounds()
  const { start: ms, end: me } = monthBounds()
  console.log(patients)
  const total = patients.length
  const pending = patients.filter(p => (p.status || '').toLowerCase() === 'pending').length
  const completed = patients.filter(p => (p.status || '').toLowerCase() === 'completed').length
  const totalDebt = calcDebt(patients)

  const todayRev = calcRevenue(patients, ts, te)
  const monthRev = calcRevenue(patients, ms, me)

  const todayNet = Math.round(todayRev * (1 - DOCTOR_SHARE_PERCENT / 100))
  const monthNet = Math.round(monthRev * (1 - DOCTOR_SHARE_PERCENT / 100))

  const CURR = n => `${Number(n || 0).toLocaleString('en-US')} EGP`

  function go(page) { if (onNavigate) onNavigate(page) }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="dash-hero dash-hero--violet animate-fade-up">
        <PulseLine className="dash-hero__pulse" />
        <ToothWatermark size={140} />
        <div className="dash-hero__content">
          <div className="dash-hero__badge"><ToothIcon size={24} color="#fff" /></div>
          <div>
            <div className="dash-hero__eyebrow">أهلاً بيك</div>
            <div className="dash-hero__title">{user?.fullName || user?.name || 'موظف الاستقبال'}</div>
            <div className="dash-hero__date">{pending > 0 ? `${pending} حالة معلقة` : 'كل شيء على ما يرام!'}</div>
          </div>
        </div>
        <div className="dash-hero__actions">
          {[['المرضى', total], ['معلق', pending], ['مكتمل', completed]].map(([l, v]) => (
            <div key={l} style={{ background: 'rgba(255,255,255,.14)', border: '1px solid rgba(255,255,255,.22)', borderRadius: 'var(--radius-md)', padding: '10px 18px', textAlign: 'center', backdropFilter: 'blur(8px)', minWidth: 76 }}>
              <div style={{ fontSize: 22, fontWeight: 900, fontFamily: 'Cairo,sans-serif', color: '#fff' }}>{loading ? '…' : v}</div>
              <div style={{ fontSize: 11, opacity: .8, color: '#fff' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Today + Month income ────────────────────────────────────── */}
      <div className="grid-2">
        <div className="profit-card profit-card--today">
          <PulseLine className="profit-card__pulse" />
          <div className="profit-card__eyebrow"><Sun size={14} /> الإجمالي اليومي</div>
          <div className="profit-card__value">{loading ? '…' : CURR(todayRev)}</div>
          <div style={{ position: 'relative', zIndex: 1, fontSize: 12, opacity: .8, marginTop: 8 }}>
            دخل اليوم بعد نسبة الأطباء: {CURR(todayNet)}
          </div>
        </div>
        <div className="profit-card" style={{ background: 'linear-gradient(135deg,#065f46,#059669)' }}>
          <PulseLine className="profit-card__pulse" />
          <div className="profit-card__eyebrow"><CalendarDays size={14} /> دخل الشهر</div>
          <div className="profit-card__value">{loading ? '…' : CURR(monthRev)}</div>
          <div style={{ position: 'relative', zIndex: 1, fontSize: 12, opacity: .8, marginTop: 8 }}>
            الإجمالي الشهري بعد نسبة الأطباء: {CURR(monthNet)}
          </div>
        </div>
      </div>

      {/* ── Vital stats ──────────────────────────────────────────────── */}
      <div className="grid-4">
        <VitalCard loading={loading} icon={Users} value={total} label="المرضى" accent="var(--clinic-violet)" accentBg="rgba(124,58,237,.12)" />
        <VitalCard loading={loading} icon={Clock} value={pending} label="معلق" accent="var(--clinic-gold)" accentBg="rgba(245,158,11,.12)" />
        <VitalCard loading={loading} icon={CheckCircle} value={completed} label="مكتمل" accent="var(--clinic-teal)" accentBg="var(--clinic-mint)" />
        <VitalCard loading={loading} icon={AlertCircle} value={CURR(totalDebt)} label="المديونيات" sub="إجمالي المديونيات" accent="var(--clinic-coral)" accentBg="rgba(251,113,133,.12)" />
      </div>

      {/* ── Quick actions ────────────────────────────────────────────── */}
      <div className="grid-3">
        {[
          { label: 'مريض جديد', desc: 'تسجيل مريض جديد', icon: UserPlus, page: 'new-patient', bg: 'linear-gradient(135deg,#0d9488,#14b8a6)', sh: 'rgba(20,184,166,.35)' },
          { label: 'كل المرضى', desc: 'تصفح وإدارة المرضى', icon: Users, page: 'patients', bg: 'linear-gradient(135deg,#6d28d9,#8b5cf6)', sh: 'rgba(139,92,246,.35)' },
          { label: 'المدفوعات', desc: 'عرض سجلات الدفع', icon: DollarSign, page: 'payments', bg: 'linear-gradient(135deg,#d97706,#f59e0b)', sh: 'rgba(245,158,11,.35)' },
        ].map(({ label, desc, icon: Icon, page, bg, sh }) => (
          <button
            key={page}
            className="quick-action"
            onClick={() => go(page)}
            style={{ '--qa-bg': bg, '--qa-shadow': sh }}
          >
            <div className="quick-action__icon"><Icon size={20} color="#fff" /></div>
            <div>
              <div className="quick-action__label">{label}</div>
              <div className="quick-action__desc">{desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* ── Debt alert ───────────────────────────────────────────────── */}
      {totalDebt > 0 && !loading && (
        <div className="debt-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="debt-banner__icon"><AlertCircle size={20} /></div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>تنبيه: يوجد مديونيات غير مسددة</div>
              <div style={{ fontSize: 13, opacity: .85, marginTop: 2 }}>
                {patients.filter(p => Number(p.totalCost || 0) - Number(p.costPaid || 0) > 0).length} مرضى لديهم أرصدة متأخرة
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 900, fontFamily: 'Cairo,sans-serif' }}>{CURR(totalDebt)}</div>
            <div style={{ fontSize: 11, opacity: .8 }}>إجمالي المديونيات</div>
          </div>
        </div>
      )}

      {/* ── Recent patients ──────────────────────────────────────────── */}
      <div className="card" style={{ padding: 24 }}>
        <SectionHead
          icon={Users}
          title="آخر المرضى"
          action={
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" onClick={load} disabled={loading} style={{ padding: '6px 12px', fontSize: 12, gap: 5 }}>
                <RefreshCw size={13} style={{ animation: loading ? 'spin .7s linear infinite' : 'none' }} /> تحديث
              </button>
              <button onClick={() => go('patients')} style={{ background: 'none', border: 'none', color: 'var(--clinic-teal)', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                عرض الكل <ArrowRight size={13} />
              </button>
            </div>
          }
        />
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{[1, 2, 3].map(i => <Sk key={i} h={44} r={8} />)}</div>
        ) : patients.length === 0 ? (
          <div className="empty-state"><Users size={40} /><h3>لا يوجد المرضى بعد</h3><button className="btn btn-primary" onClick={() => go('new-patient')} style={{ marginTop: 8 }}><UserPlus size={14} /> إضافة مريض</button></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>المريض</th><th>الهاتف</th><th>الحالة</th><th>مدفوع</th><th>الباقي</th></tr></thead>
              <tbody>
                {patients.slice(0, 5).map((p, i) => {
                  const rem = Number(p.totalCost || 0) - Number(p.costPaid || 0)
                  return (
                    <tr key={i}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar" style={{ width: 30, height: 30, fontSize: 11, background: 'var(--clinic-violet)' }}>{(p.fullName || p.name || '؟')[0]}</div>
                          <span style={{ fontWeight: 600, fontSize: 14 }}>{p.fullName || p.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{p.phone || '—'}</td>
                      <td>{statusBadge(p.status)}</td>
                      <td style={{ fontWeight: 600, color: 'var(--clinic-teal)', fontSize: 13 }}>{CURR(p.costPaid)}</td>
                      <td><span style={{ fontWeight: 700, fontSize: 13, color: rem > 0 ? 'var(--clinic-coral)' : 'var(--clinic-teal)' }}>{CURR(rem)}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
