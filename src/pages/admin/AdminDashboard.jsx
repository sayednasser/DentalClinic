import { useEffect, useState, useCallback } from 'react'
import { adminAPI, patientsAPI, expensesAPI, } from '../../api'
import { useToast } from '../../context/ToastContext'
import {
  Users, DollarSign, Stethoscope, AlertCircle,
  TrendingUp, CheckCircle, RefreshCw, Plus, Trash2,
  X, Calendar, Banknote, PiggyBank, BarChart3, Activity,
  Sun, CalendarDays, Wallet
} from 'lucide-react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import {
  calcTotalCost,
  todayBounds,
  monthBounds,
  filterByDate,
  calcRevenue,
  calcDebt,
  calcDoctorShare,
  DOCTOR_SHARE_PERCENT
} from '../../utils/finance'

/* ── ECG pulse-line signature, reused across hero + profit cards ── */
function PulseLine({ className }) {
  return (
    <svg className={className} viewBox="0 0 600 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 40 L80 40 L100 10 L120 70 L140 40 L180 40 L200 20 L215 55 L230 40 L600 40" />
    </svg>
  )
}

function Sk({ h = 28, w = '100%', r = 6 }) {
  return <div style={{ height: h, width: w, background: 'var(--border)', borderRadius: r, opacity: .5 }} />
}

function VitalCard({ icon: Icon, accent, accentBg, value, label, sub, loading }) {
  return (
    <div
      className="vital-card animate-fade-up"
      style={{ '--vc-accent': accent, '--vc-accent-bg': accentBg }}
    >
      <div className="vital-card__icon"><Icon size={20} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {loading ? <Sk h={26} w={90} /> : <div className="vital-card__value">{value ?? '0'}</div>}
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
  return <span className={`badge ${m[(s || '').toLowerCase()] || 'badge-blue'}`} >{s || '—'}</span>
}

// Modal wrapper
function Modal({ title, onClose, children, maxWidth = 520 }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth }}>
        <div className="modal-header">
          <h3 style={{ fontSize: 17, fontWeight: 700 }}>{title}</h3>
          <button className="icon-btn" onClick={onClose}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

const EXPENSE_CATEGORIES = [
  'رواتب', 'إيجار', 'مستلزمات طبية', 'كهرباء وماء', 'صيانة', 'تسويق', 'أخرى'
]

export default function AdminDashboard({ onNavigate } = {}) {
  const { toast } = useToast()
  const [patients, setPatients] = useState([])
  const [doctorPerformance, setDoctorPerformance] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [expenses, setExpenses] = useState([])
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [expForm, setExpForm] = useState({ description: '', amount: '', category: 'رواتب', date: new Date().toISOString().slice(0, 10) })

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [p, u, d] = await Promise.allSettled([
        patientsAPI.getAll(),
        adminAPI.getUsers(),
        adminAPI.getDoctorsPerf()
      ])

      if (p.status === 'fulfilled') {
        setPatients(
          p.value?.data?.patients || []
        )
      }
      if (u.status === 'fulfilled') setUsers(Array.isArray(u.value) ? u.value : u.value?.data || [])

      if (d.status === 'fulfilled') setDoctorPerformance(Array.isArray(d.value) ? d.value : d.value?.data || [])

    } catch { toast('فشل تحميل البيانات', 'error') }
    const [p, u, d, e] = await Promise.allSettled([
      patientsAPI.getAll(),
      adminAPI.getUsers(),
      adminAPI.getDoctorsPerf(),
      expensesAPI.getAll()
    ])

    if (e.status === "fulfilled") {
      setExpenses(e.value.data || [])
    }

    setLoading(false)
  }, [toast])

  useEffect(() => { load() }, [])

  // ── التاريخ filters ──────────────────────────────────────────────────
  const { start: todayStart, end: todayEnd } = todayBounds()
  const { start: monthStart, end: monthEnd } = monthBounds()
  const now = new Date()

  // Revenue from payment history
  const todayRevenue = calcRevenue(
    patients,
    todayStart,
    todayEnd
  )

  const monthRevenue = calcRevenue(
    patients,
    monthStart,
    monthEnd
  )

  // Doctor share from collected payments only
  const todayDrShare = calcDoctorShare(
    patients,
    DOCTOR_SHARE_PERCENT,
    todayStart,
    todayEnd
  )

  const monthDrShare = calcDoctorShare(
    patients,
    DOCTOR_SHARE_PERCENT,
    monthStart,
    monthEnd
  )
  const totalRevenue = calcRevenue(patients)
  const totalDebt = calcDebt(patients)



  // ── المصروفات ──────────────────────────────────────────────────────
  const todayExp = expenses
    .filter(e => {
      const d = new Date(e.date)
      return d >= todayStart && d <= todayEnd
    })
    .reduce((s, e) => s + Number(e.amount), 0)
  const monthExp = expenses
    .filter(e => {
      const d = new Date(e.date)
      return d >= monthStart && d <= monthEnd
    })
    .reduce((s, e) => s + Number(e.amount), 0)
  // ── الدخل ─────────────────────────────────────────────────────────
  const [incomeDate, setIncomeDate] = useState(new Date().toISOString().slice(0, 10));

  const [income, setIncome] = useState({
    totalIncome: 0,
    patientsCount: 0,
  });
  // ── Net profit ────────────────────────────────────────────────────
  const todayProfit = todayRevenue - todayDrShare - todayExp
  const monthProfit = monthRevenue - monthDrShare - monthExp

  // ── Doctors performance ───────────────────────────────────────────
  const doctors = users.filter(u => Number(u.role) === 2)
  const doctorStats = doctorPerformance.map(dr => ({
    id: dr._id,
    name: dr.doctorName,
    spec: dr.specialization,
    total: dr.patientsCount,
    revenue: dr.revenue,
    debt: dr.debt,
    doctorShare: dr.doctorShare
  }))


  // ── Monthly chart ─────────────────────────────────────────────────
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const start = new Date(d.getFullYear(), d.getMonth(), 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
    const pts = filterByDate(patients, start, end)
    const rev = calcRevenue(pts)
    const drSh = calcDoctorShare(pts)
    const expM = expenses
      .filter(e => {
        const x = new Date(e.date)
        return (
          x.getFullYear() === d.getFullYear() &&
          x.getMonth() === d.getMonth()
        )
      })
      .reduce((s, e) => s + Number(e.amount), 0)
    const profit = rev - drSh - expM
    const label = d.toLocaleString('ar-EG', { month: 'short' })
    return { month: label, revenue: rev, doctorShare: drSh, expenses: expM, profit: Math.max(0, profit) }
  }).reverse()
  async function loadIncome() {
    if (!incomeDate) return;

    try {
      const res = await adminAPI.getIncome(incomeDate);
      setIncome(res.data);
    } catch (err) {
      console.log(err);
    }
  }
  // ── إضافة expense ───────────────────────────────────────────────────
  async function handleAddExpense(e) {
    e.preventDefault()

    if (!expForm.description || !expForm.amount) {
      toast("أدخل الوصف والمبلغ", "error")
      return
    }

    try {
      await expensesAPI.create({
        title: expForm.category,
        category: expForm.category,
        description: expForm.description,
        amount: Number(expForm.amount),
        type: "expense",
        date: expForm.date
      })

      const res = await expensesAPI.getAll()
      setExpenses(res.data || [])

      setExpForm({
        description: "",
        amount: "",
        category: "رواتب",
        date: new Date().toISOString().slice(0, 10)
      })

      setShowExpenseModal(false)
      toast("تم إضافة المصروف", "success")
    } catch (err) {
      console.log(err)
      toast("فشل إضافة المصروف", "error")
    }
  }

  async function handleDeleteExpense(id) {
    try {
      await expensesAPI.delete(id)

      const res = await expensesAPI.getAll()
      setExpenses(res.data || [])

      toast("تم حذف المصروف", "success")
    } catch {
      toast("فشل حذف المصروف", "error")
    }
  }

  const CURR = (n) => `${Number(n || 0).toLocaleString('ar-EG')} ج.م`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="dash-hero animate-fade-up">
        <PulseLine className="dash-hero__pulse" />
        <div className="dash-hero__content">
          <div className="dash-hero__badge"><Activity size={24} /></div>
          <div>
            <div className="dash-hero__eyebrow">عيادتك اليوم</div>
            <div className="dash-hero__title">لوحة التحكم</div>
            <div className="dash-hero__date">
              {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
        <div className="dash-hero__actions">
          <button className="btn btn-primary" onClick={() => setShowExpenseModal(true)}>
            <Plus size={14} /> إضافة مصروف
          </button>
          <button className="btn btn-primary" onClick={load} disabled={loading}>
            <RefreshCw size={14} style={{ animation: loading ? 'spin .7s linear infinite' : 'none' }} />
            تحديث
          </button>
        </div>
      </div>

      {/* ── TODAY / MONTH profit ────────────────────────────────────── */}
      <div className="grid-2">
        <div className="profit-card profit-card--today">
          <PulseLine className="profit-card__pulse" />
          <div className="profit-card__eyebrow"><Sun size={14} /> ربح اليوم</div>
          <div className="profit-card__value">{loading ? '…' : CURR(todayProfit)}</div>
          <div className="profit-card__breakdown">
            {[['الدخل', CURR(todayRevenue)], ['نسبة الأطباء', CURR(todayDrShare)], ['المصروفات', CURR(todayExp)]].map(([l, v]) => (
              <div key={l} className="profit-card__chip">
                <div className="profit-card__chip-label">{l}</div>
                <div className="profit-card__chip-value">{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="profit-card profit-card--month">
          <PulseLine className="profit-card__pulse" />
          <div className="profit-card__eyebrow"><CalendarDays size={14} /> ربح الشهر</div>
          <div className="profit-card__value">{loading ? '…' : CURR(monthProfit)}</div>
          <div className="profit-card__breakdown">
            {[['الدخل', CURR(monthRevenue)], ['نسبة الأطباء', CURR(monthDrShare)], ['المصروفات', CURR(monthExp)]].map(([l, v]) => (
              <div key={l} className="profit-card__chip">
                <div className="profit-card__chip-label">{l}</div>
                <div className="profit-card__chip-value">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Vital stat cards ───────────────────────────────────────── */}
      <div className="grid-4">
        <VitalCard
          loading={loading} icon={Users} value={patients.length} label="إجمالي المرضى"
          accent="var(--clinic-sky)" accentBg="rgba(56,189,248,.12)"
        />
        <VitalCard
          loading={loading} icon={DollarSign} value={CURR(totalRevenue)} label="إجمالي المحصّل"
          accent="var(--clinic-teal)" accentBg="var(--clinic-mint)"
        />
        <VitalCard
          loading={loading} icon={AlertCircle} value={CURR(totalDebt)} label="إجمالي الديون"
          accent="var(--clinic-coral)" accentBg="rgba(251,113,133,.12)"
        />
        <VitalCard
          loading={loading} icon={Stethoscope} value={doctors.length} label="الأطباء النشطون"
          accent="var(--clinic-gold)" accentBg="rgba(245,158,11,.12)"
        />
      </div>

      {/* ── دخل اليوم المختار (مربع واحد موحّد) ─────────────────────── */}
      <div className="income-card animate-fade-up">
        <div className="income-card__top">
          <div className="income-card__label">
            <Calendar size={16} color="var(--clinic-teal)" /> دخل يوم محدد
          </div>
          <div className="income-card__date-wrap">
            <input
              type="date"
              className="input-field"
              value={incomeDate}
              onChange={(e) => setIncomeDate(e.target.value)}
            />
            <button className="btn btn-primary" onClick={loadIncome} style={{ padding: '9px 18px', fontSize: 13 }}>عرض</button>
          </div>
        </div>

        <div className="income-card__body">
          <div className="income-card__metric" style={{ '--ic-accent': 'var(--clinic-teal)', '--ic-accent-bg': 'var(--clinic-mint)' }}>
            <div className="income-card__metric-icon"><Wallet size={20} /></div>
            <div>
              <div className="income-card__metric-value">{Number(income.totalIncome || 0).toLocaleString('ar-EG')} ج.م</div>
              <div className="income-card__metric-label">إجمالي الدخل</div>
            </div>
          </div>

          <div className="income-card__divider" />

          <div className="income-card__metric" style={{ '--ic-accent': 'var(--clinic-sky)', '--ic-accent-bg': 'rgba(56,189,248,.12)' }}>
            <div className="income-card__metric-icon"><Users size={20} /></div>
            <div>
              <div className="income-card__metric-value">{income.patientsCount || 0}</div>
              <div className="income-card__metric-label">عدد الحالات</div>
            </div>
          </div>
        </div>
      </div>


      {/* ── Monthly chart ───────────────────────────────────────────── */}
      <div className="card" style={{ padding: 24 }}>
        <SectionHead
          icon={BarChart3}
          title="التحليل المالي الشهري"
          sub="آخر 6 أشهر — الدخل، نسبة الأطباء، المصروفات، الصافي"
        />
        {loading ? <Sk h={240} r={12} /> : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={last6Months} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fontFamily: 'Cairo' }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => v.toLocaleString('ar-EG')} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', fontSize: 12, fontFamily: 'Cairo' }} formatter={(v, n) => [`${v.toLocaleString('ar-EG')} ج.م`, n]} />
              <Legend wrapperStyle={{ fontFamily: 'Cairo', fontSize: 12 }} />
              <Bar dataKey="revenue" name="الدخل" fill="#0d9488" radius={[4, 4, 0, 0]} />
              <Bar dataKey="doctorShare" name="نسبة الأطباء" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="المصروفات" fill="#fb7185" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" name="الصافي" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Doctors performance ─────────────────────────────────────── */}
      <div className="card" style={{ padding: 24 }}>
        <SectionHead
          icon={Stethoscope}
          title="أداء الطبيب"
          sub={`نسبة الأطباء ${DOCTOR_SHARE_PERCENT ?? 40}% من الإيرادات`}
        />

        {loading ? (
          <Sk h={120} r={10} />
        ) : doctorPerformance.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px 0' }}>
            <Stethoscope size={32} />
            <p>لا يوجد أطباء بعد</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>الدكتور</th>
                  <th>الحالات</th>
                  <th>مكتمله</th>
                  <th>قيد الانتظار</th>
                  <th>الربح</th>
                  <th>مدفوع</th>
                  <th>الباقي</th>
                </tr>
              </thead>

              <tbody>
                {doctorPerformance.map((dr, i) => (


                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          className="avatar"
                          style={{ width: 36, height: 36, fontSize: 13, background: 'var(--clinic-teal)', flexShrink: 0 }}
                        >
                          {(dr.doctorName || '?')[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{dr.doctorName}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{dr.specialization}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ fontWeight: 700 }}>{dr.patientsCount || 0}</td>

                    <td><span className="badge badge-green">{dr.completedCases || 0}</span></td>

                    <td><span className="badge badge-amber">{dr.pendingCases || 0}</span></td>

                    {/* إجمالي مستحقات الدكتور */}
                    <td style={{ color: 'var(--clinic-teal)', fontWeight: 700 }}>
                      {CURR(dr.doctorTotalRights)}
                    </td>

                    {/* المستحق حالياً من الفلوس المدفوعة */}
                    <td><span className="badge badge-blue">{CURR(dr.doctorReceived)}</span></td>

                    {/* المتبقي للدكتور من الفلوس غير المحصلة */}
                    <td>
                      <span className={`badge ${dr.doctorRemaining > 0 ? 'badge-red' : 'badge-green'}`}>
                        {CURR(dr.doctorRemaining)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── المصروفات ────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 24 }}>
        <SectionHead
          icon={Wallet}
          title="المصروفات"
          sub={`اليوم: ${CURR(todayExp)} · الشهر: ${CURR(monthExp)}`}
          action={
            <button className="btn btn-primary" onClick={() => setShowExpenseModal(true)} style={{ padding: '8px 16px', fontSize: 13 }}>
              <Plus size={14} /> إضافة مصروف
            </button>
          }
        />
        {expenses.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px 0' }}>
            <Banknote size={32} /><p>لم تُضَف أي المصروفات بعد</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>الوصف</th><th>الفئة</th><th>التاريخ</th><th>المبلغ</th><th>حذف</th></tr></thead>
              <tbody>

                {[...expenses].reverse().slice(0, 5).map(e => (

                  <tr key={e.id}>
                    <td style={{ fontWeight: 600 }}>{e.description}</td>
                    <td><span className="badge badge-blue">{e.category}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{new Date(e.date).toLocaleDateString('ar-EG')}</td>
                    <td style={{ fontWeight: 700, color: 'var(--clinic-coral)' }}>{CURR(e.amount)}</td>
                    <td><button className="icon-btn" onClick={() => handleDeleteExpense(e.id)} style={{ color: 'var(--clinic-coral)' }}><Trash2 size={14} /></button></td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button
            className="btn btn-ghost"
            onClick={() => onNavigate && onNavigate('expenses')}
            style={{ width: '100%' }}
          >
            عرض جميع المصروفات
          </button>
        </div>
      </div>

      {/* ── آخر المرضى ───────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 24 }}>
        <SectionHead icon={Users} title="آخر المرضى" />
        {loading ? <Sk h={100} r={8} /> : patients.length === 0 ? <div className="empty-state" style={{ padding: '20px 0' }}><p>لا يوجد المرضى بعد</p></div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>المريض</th><th>الحالة</th><th>الإجمالي</th><th>مدفوع</th><th>الباقي</th></tr></thead>
              <tbody>
                {[...patients].reverse().slice(0, 5).map((p, i) => {
                  const rem = Number(p.totalCost || 0) - Number(p.costPaid || 0)
                  return (
                    <tr key={i}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="avatar" style={{ width: 28, height: 28, fontSize: 11, background: 'var(--clinic-teal)' }}>{(p.fullName || p.name || '?')[0]}</div>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: 13 }}>{p.fullName || p.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>العمر {p.age || '—'} · {p.gender === 'male' ? 'ذكر' : p.gender === 'female' ? 'أنثى' : '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td>{statusBadge(p.status)}</td>
                      <td style={{ fontSize: 13 }}>{CURR(p.totalCost)}</td>
                      <td style={{ fontWeight: 600, color: 'var(--clinic-teal)', fontSize: 13 }}>{CURR(p.costPaid)}</td>
                      <td style={{ fontWeight: 700, fontSize: 13, color: rem > 0 ? 'var(--clinic-coral)' : 'var(--clinic-teal)' }}>{CURR(rem)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* إضافة expense modal */}
      {showExpenseModal && (
        <Modal title="إضافة مصروف جديد" onClose={() => setShowExpenseModal(false)}>
          <form onSubmit={handleAddExpense}>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="input-group">
                <label>وصف المصروف *</label>
                <input className="input-field" placeholder="مثال: راتب الدكتور أحمد" value={expForm.description} onChange={e => setExpForm(f => ({ ...f, description: e.target.value }))} required />
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label>المبلغ (ج.م) *</label>
                  <input className="input-field" type="number" min="0" placeholder="5000" value={expForm.amount} onChange={e => setExpForm(f => ({ ...f, amount: e.target.value }))} required />
                </div>
                <div className="input-group">
                  <label>التاريخ</label>
                  <input className="input-field" type="date" value={expForm.date} onChange={e => setExpForm(f => ({ ...f, date: e.target.value }))} />
                </div>
              </div>
              <div className="input-group">
                <label>الفئة</label>
                <select className="input-field" value={expForm.category} onChange={e => setExpForm(f => ({ ...f, category: e.target.value }))}>
                  {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn btn-primary"><Plus size={14} /> إضافة</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowExpenseModal(false)}>إلغاء</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
