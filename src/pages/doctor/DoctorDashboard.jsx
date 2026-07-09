import { useEffect, useState, useCallback } from 'react'
import { doctorAPI, patientsAPI } from '../../api'
import PatientDetails from '../Patients/pages/PatientDetails'
import { patientService } from '../Patients/services/patientService'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { Users, CheckCircle, Clock, AlertCircle, RefreshCw, Sun, CalendarDays, UserCheck, Hourglass } from 'lucide-react'
import {
  todayBounds,
  monthBounds,
  calcRevenue,
  calcDoctorShare,
  calcDebt,
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

function VitalCard({ icon: Icon, accent, accentBg, value, label, loading }) {
  return (
    <div className="vital-card animate-fade-up" style={{ '--vc-accent': accent, '--vc-accent-bg': accentBg }}>
      <div className="vital-card__icon"><Icon size={20} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {loading ? <Sk h={26} w={80} /> : <div className="vital-card__value">{value ?? '0'}</div>}
        <div className="vital-card__label">{label}</div>
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

/* ── Queue cards (Current / Next patient) ───────────────────────── */
function patientDisplayName(p) {
  return p.fullName || `${p.firstName || ''} ${p.middleName || ''} ${p.lastName || ''}`.trim() || p.name || '—'
}

function QueueCard({ variant, icon: Icon, title, patient, CURR, emptyText, children }) {
  const accent = variant === 'current' ? 'var(--clinic-teal)' : 'var(--clinic-gold)'
  const accentBg = variant === 'current' ? 'var(--clinic-mint)' : 'rgba(245,158,11,.12)'

  const pname = patient ? patientDisplayName(patient) : null
  const paid = Number(patient?.costPaid || 0)
  const cost = Number(patient?.totalCost || 0)
  const rem = cost - paid

  return (
    <div
      className="card animate-fade-up"
      style={{
        padding: 20,
        borderInlineStart: `4px solid ${accent}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: 8,
            background: accentBg,
            color: accent
          }}
        >
          <Icon size={16} />
        </span>
        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-main)' }}>{title}</span>
      </div>

      {!patient ? (
        <div className="empty-state" style={{ padding: '20px 0' }}>
          <Icon size={28} />
          <p>{emptyText}</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="avatar" style={{ width: 40, height: 40, fontSize: 14, background: accent }}>
              {pname[0]?.toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{pname}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{patient.diagnosis || 'لا يوجد تشخيص'}</div>
            </div>
            {statusBadge(patient.status)}
          </div>

          {rem > 0 && (
            <div style={{ fontSize: 12, color: 'var(--clinic-coral)', fontWeight: 600 }}>
              {CURR(rem)} متبقي
            </div>
          )}

          {children}
        </>
      )}
    </div>
  )
}

export default function DoctorDashboard() {
  const { user, updateUser } = useAuth()
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [doctors, setDoctors] = useState([])
  const { toast } = useToast()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [dashboard, setDashboard] = useState({
    todayPatients: [],
    todayPatientsCount: 0
  })


  useEffect(() => {
    patientService.getDoctors()
      .then(setDoctors)
      .catch(() => setDoctors([]))
  }, [])
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [dashboardRes, dp, ap] = await Promise.allSettled([
        doctorAPI.getDashboard(),
        doctorAPI.getPatients(),
        patientsAPI.getAll()
      ])

      let list = []
      if (dp.status === 'fulfilled') list = Array.isArray(dp.value) ? dp.value : dp.value?.data || []
      if (list.length === 0 && ap.status === 'fulfilled') list = Array.isArray(ap.value) ? ap.value : ap.value?.data || []
      if (dashboardRes.status === 'fulfilled') {
        setDashboard(
          dashboardRes.value?.data || dashboardRes.value
        )
      }
      setPatients(list)
    } catch { toast('فشل تحميل البيانات', 'error') }
    finally { setLoading(false) }
  }, [toast])

  useEffect(() => { load() }, [load])

  const todayPatients = dashboard?.todayPatients || []

  const currentPatient = todayPatients.find(p => p.status === 'active') || null
  const nextPatient = todayPatients.find(p => p.status === 'pending') || null

  async function handleCompletePatient(patientId) {
    try {
      await doctorAPI.completePatient(patientId)
      toast('تم إنهاء الكشف بنجاح', 'success')
      await load()
    } catch (error) {
      toast(error.message || 'حدث خطأ', 'error')
    }
  }

  const { start: ts, end: te } = todayBounds()
  const { start: ms, end: me } = monthBounds()
  const todayRev = calcRevenue(patients, ts, te)
  const monthRev = calcRevenue(patients, ms, me)


  const todayShare = calcDoctorShare(
    patients,
    DOCTOR_SHARE_PERCENT,
    ts,
    te
  )

  const monthShare = calcDoctorShare(
    patients,
    DOCTOR_SHARE_PERCENT,
    ms,
    me
  )
  const totalDebt = calcDebt(patients)
  const doctorDebt = patients.reduce((sum, p) => {
    const totalCost = Number(p.totalCost || 0)
    const paid = Number(p.costPaid || 0)
    const remaining = Math.max(0, totalCost - paid)
    return sum + (remaining * DOCTOR_SHARE_PERCENT / 100)
  }, 0)

  const completed = todayPatients.filter(p => (p.status || '').toLowerCase() === 'completed').length
  const pending = todayPatients.filter(p => (p.status || '').toLowerCase() === 'pending').length
  const active = todayPatients.filter(p => (p.status || '').toLowerCase() === 'active').length



  const CURR = n => `${Number(n || 0).toLocaleString('en-US')} EGP`
  const name = user?.fullName || `${user?.firstName || ''} ${user?.middleName || ''} ${user?.lastName || ''}`.trim() || user?.name || 'Doctor'


  if (selectedPatient) {
    return (
      <PatientDetails
        patientId={selectedPatient._id}
        initialPatient={selectedPatient}
        doctors={doctors}
        role="doctor"
        canEdit={false}
        canDelete={false}
        onBack={() => setSelectedPatient(null)}
        onDeleted={() => {
          setSelectedPatient(null)
          load()
        }}
      />
    )
  }

  console.log("================================");
  console.log(
    todayPatients.map(p => ({
      name: p.firstName,
      status: p.status,
      doctorId: p.doctorId,
      visits: p.visits
    }))
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="dash-hero dash-hero--teal animate-fade-up">
        <PulseLine className="dash-hero__pulse" />
        <ToothWatermark size={140} />
        <div className="dash-hero__content">
          <div className="dash-hero__badge"><ToothIcon size={24} color="#fff" /></div>
          <div>
            <div className="dash-hero__eyebrow">يوم سعيد</div>
            <div className="dash-hero__title">د / {name}</div>
            <div className="dash-hero__date">
              {active > 0 ? `${active} حالة نشطة حاليًا` : 'إليك نظرة عامة على عيادتك'}
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

      {/* ── Today + Month share ─────────────────────────────────────── */}
      <div className="grid-2">
        <div className="profit-card profit-card--today">
          <PulseLine className="profit-card__pulse" />
          <div className="profit-card__eyebrow"><Sun size={14} /> نصيبي اليومي</div>
          <div className="profit-card__value">{loading ? '…' : CURR(todayShare)}</div>
          <div style={{ position: 'relative', zIndex: 1, fontSize: 12, opacity: .8, marginTop: 8 }}>
            ({DOCTOR_SHARE_PERCENT}% من دخل اليوم {CURR(todayRev)})
          </div>
        </div>
        <div className="profit-card profit-card--month">
          <PulseLine className="profit-card__pulse" />
          <div className="profit-card__eyebrow"><CalendarDays size={14} /> نصيبي الشهري</div>
          <div className="profit-card__value">{loading ? '…' : CURR(monthShare)}</div>
          <div style={{ position: 'relative', zIndex: 1, fontSize: 12, opacity: .8, marginTop: 8 }}>
            ({DOCTOR_SHARE_PERCENT}% من دخل الشهر {CURR(monthRev)})
          </div>
        </div>
      </div>

      {/* ── Vital stats ──────────────────────────────────────────────── */}
      <div className="grid-4">
        <VitalCard loading={loading} icon={Users} value={dashboard.todayPatientsCount} label="إجمالي المرضى" accent="var(--clinic-sky)" accentBg="rgba(56,189,248,.12)" />
        <VitalCard loading={loading} icon={CheckCircle} value={completed} label="حالات مكتملة" accent="var(--clinic-teal)" accentBg="var(--clinic-mint)" />
        <VitalCard loading={loading} icon={Clock} value={pending} label="حالات معلقة" accent="var(--clinic-gold)" accentBg="rgba(245,158,11,.12)" />
        <VitalCard loading={loading} icon={AlertCircle} value={CURR(doctorDebt)} label="إجمالي المديونيات" accent="var(--clinic-coral)" accentBg="rgba(251,113,133,.12)" />
      </div>

      {/* ── Queue: current + next patient ───────────────────────────── */}
      {!loading && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16
          }}
        >
          <QueueCard
            variant="current"
            icon={UserCheck}
            title="المريض الحالي"
            patient={currentPatient}
            CURR={CURR}
            emptyText="لا يوجد مريض حالي"
          >
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => setSelectedPatient({ _id: currentPatient._id })}
              >
                فتح الملف
              </button>
              <button
                className="btn btn-success"
                style={{ flex: 1 }}
                onClick={() => handleCompletePatient(currentPatient._id)}
              >
                إنهاء الكشف
              </button>
            </div>
          </QueueCard>

          <QueueCard
            variant="next"
            icon={Hourglass}
            title="المريض التالي"
            patient={nextPatient}
            CURR={CURR}
            emptyText="لا يوجد مريض في الانتظار"
          >
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
              في انتظار دوره
            </div>
          </QueueCard>
        </div>
      )}

      {/* ── Chart + recent patients ─────────────────────────────────── */}
      <div className="grid-12">


        <div className="card" style={{ padding: 24 }}>
          <SectionHead
            icon={Users}
            title="قائمة مرضى اليوم"
            action={<span className="badge badge-teal">{dashboard.todayPatientsCount} مريض اليوم</span>}
          />
          {!loading && totalDebt > 0 && (
            <div className="debt-banner" style={{ marginBottom: 14, padding: '10px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={16} />
                <span style={{ fontWeight: 700, fontSize: 13 }}>باقي المديونيات</span>
              </div>
              <span style={{ fontWeight: 800, fontSize: 14 }}>{CURR(totalDebt)}</span>
            </div>
          )}
          {loading ? <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{[1, 2, 3].map(i => <Sk key={i} h={52} r={10} />)}</div>
            : todayPatients.length === 0 ? <div className="empty-state" style={{ padding: '30px 0' }}><Users size={32} /><p>لا يوجد مرضى بعد</p></div>
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {todayPatients.map((p, i) => {
                    const pname = p.fullName || `${p.firstName || ''} ${p.middleName || ''} ${p.lastName || ''}`.trim() || p.name || '—'
                    const paid = Number(p.costPaid || 0)
                    const cost = Number(p.totalCost || 0)
                    const rem = cost - paid
                    return (
                      <div
                        key={i}
                        className="mini-row"
                        onClick={() => setSelectedPatient({
                          _id: p._id
                        })}
                        style={{
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar" style={{ width: 32, height: 32, fontSize: 12, background: 'var(--clinic-teal)' }}>{pname[0]?.toUpperCase()}</div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>{pname}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.diagnosis || 'لا يوجد تشخيص'}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                          {statusBadge(p.status)}
                          {rem > 0 && <div style={{ fontSize: 11, color: 'var(--clinic-coral)', fontWeight: 600 }}>{CURR(rem)} متبقي</div>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
        </div>
      </div>
    </div>
  )
}
