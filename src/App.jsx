import { useState, useEffect, lazy, Suspense } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ThemeProvider } from './context/ThemeContext'
import { normalizeRole } from './utils/roles'
import { AR } from './utils/ar'
import { adminAPI, patientsAPI } from './api'
import './styles/appointments.css'

const Landing = lazy(() => import('./pages/Landing'))
const Login = lazy(() => import('./pages/auth/Login'))
const Layout = lazy(() => import('./components/layout/Layout'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminStaff = lazy(() => import('./pages/admin/AdminStaff'))
const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard'))
const ReceptionistDashboard = lazy(() => import('./pages/receptionist/ReceptionistDashboard'))
const WaitingQueue = lazy(() => import('./pages/receptionist/WaitingQueue'))
const Patients = lazy(() => import('./pages/Patients'))
const UserProfile = lazy(() => import('./pages/UserProfile'))
const AppointmentsPage = lazy(() => import('./pages/appointments/AppointmentsPage'))
const ExpensesPage = lazy(() => import('./pages/expenses/ExpensesPage'))
const ReviewsManagement = lazy(() => import('./pages/admin/ReviewsManagement'))

const PAGE_TITLES = {
  dashboard: 'لوحة التحكم',
  patients: 'المرضى',
  doctors: 'الأطباء',
  staff: 'موظفو الاستقبال',
  payments: 'المدفوعات',
  debt: 'تنبيهات الديون',
  profile: 'ملفي الشخصي',
  'new-patient': 'مريض جديد',
  appointments: 'إدارة المواعيد',
  expenses: 'المصروفات',
  reviews: 'التقييمات',
  'waiting-queue': 'قائمة الانتظار',
}

function PageLoader() {
  return (
    <div className="loading-center" style={{ minHeight: '60vh' }}>
      <div className="spinner" />
      <span>جارٍ التحميل...</span>
    </div>
  )
}

function SimpleTablePage({ fetcher, title, columns }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetcher().then(d => setData(Array.isArray(d) ? d : d?.data || [])).catch(() => { }).finally(() => setLoading(false))
  }, [])
  if (loading) return <PageLoader />
  return (
    <div className="card" style={{ padding: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{title}</h3>
      {data.length === 0 ? <div className="empty-state"><p>{AR.noData}</p></div> : (
        <div className="table-wrap">
          <table>
            <thead><tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}</tr></thead>
            <tbody>{data.map((row, i) => <tr key={i}>{columns.map(c => <td key={c.key} style={c.style || {}}>{c.render ? c.render(row) : (row[c.key] ?? '—')}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function DebtAlerts() {
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [pageInput, setPageInput] = useState('1')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    adminAPI
      .getDebtAlerts(page, 20)
      .then(res => {
        setData(res?.data?.patients || [])
        setPagination(res?.data?.pagination)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [page])

  useEffect(() => {
    setPageInput(String(page))
  }, [page])

  if (loading) return <PageLoader />

  const totalDebt = data.reduce(
    (sum, p) => sum + (Number(p.totalCost || 0) - Number(p.costPaid || 0)),
    0
  )

  return (
    <>
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h4>إجمالي ديون الصفحة الحالية</h4>

        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: 'var(--rose-500)'
          }}
        >
          {totalDebt.toLocaleString('ar-EG')} ج.م
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h3>الديون المتأخرة</h3>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>المريض</th>
                <th>الهاتف</th>
                <th>الإجمالي</th>
                <th>المدفوع</th>
                <th>المتبقي</th>
              </tr>
            </thead>

            <tbody>
              {data.map((r, i) => {
                const debt =
                  Number(r.totalCost || 0) - Number(r.costPaid || 0)

                return (
                  <tr key={r._id || i}>
                    <td>
                      <strong>{r.fullName}</strong>
                    </td>

                    <td>{r.phone || '—'}</td>

                    <td>
                      {Number(r.totalCost || 0).toLocaleString('ar-EG')}
                    </td>

                    <td>
                      {Number(r.costPaid || 0).toLocaleString('ar-EG')}
                    </td>

                    <td>
                      <span className="badge badge-red">
                        {debt.toLocaleString('ar-EG')} ج.م
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
              marginTop: '16px'
            }}
          >
            <button
              className="btn btn-secondary"
              disabled={page === 1}
              onClick={() => setPage(prev => prev - 1)}
            >
              السابق
            </button>

            <input
              type="number"
              min={1}
              max={pagination.totalPages}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const value = Number(pageInput)

                  if (
                    value >= 1 &&
                    value <= pagination.totalPages
                  ) {
                    setPage(value)
                  }
                }
              }}
              onBlur={() => {
                const value = Number(pageInput)

                if (
                  value >= 1 &&
                  value <= pagination.totalPages
                ) {
                  setPage(value)
                } else {
                  setPageInput(String(page))
                }
              }}
            />

            <span>من {pagination.totalPages}</span>

            <button
              className="btn btn-secondary"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(prev => prev + 1)}
            >
              التالي
            </button>
          </div>
        )}
      </div>
    </>
  )
}

function RecentPayments() {
  return (
    <SimpleTablePage
      fetcher={async () => {
        const res = await patientsAPI.getAll()

        const data = Array.isArray(res) ? res : res.data || []

        return data
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, 20)
      }}
      title={AR.recentPayments}
      columns={[
        {
          key: 'fullName',
          label: 'المريض',
          render: r => <strong>{r.fullName || r.name}</strong>
        },
        {
          key: 'phone',
          label: 'الهاتف',
          render: r => r.phone || '—'
        },
        {
          key: 'costPaid',
          label: 'المدفوع',
          render: r => (
            <span style={{ fontWeight: 700, color: 'var(--teal-700)' }}>
              {Number(r.costPaid || 0).toLocaleString('ar-EG')} ج.م
            </span>
          )
        },
        {
          key: 'remainingAmount',
          label: 'المتبقي',
          render: r => (
            <span
              style={{
                fontWeight: 700,
                color:
                  Number(r.remainingAmount || 0) > 0
                    ? 'var(--rose-500)'
                    : 'var(--emerald-500)'
              }}
            >
              {Number(r.remainingAmount || 0).toLocaleString('ar-EG')} ج.م
            </span>
          )
        },
        {
          key: 'visitDate',
          label: 'تاريخ الزيارة',
          render: r =>
            r.visitDate
              ? new Date(r.visitDate).toLocaleDateString('ar-EG')
              : '—'
        }
      ]}
    />
  )
}
function PaymentsList() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [pageInput, setPageInput] = useState('1')

  const loadPayments = async (pageNumber = 1) => {
    setLoading(true)

    try {
      const res = await patientsAPI.getAll({
        page: pageNumber,
        limit: 20
      })

      const result = res?.data || {}

      setData(result.patients || [])
      setPagination(result.pagination || null)

    } catch (err) {
      console.log(err)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPayments(page)
  }, [page])

  useEffect(() => {
    setPageInput(String(page))
  }, [page])

  if (loading) return <PageLoader />

  const totalAmount = data.reduce(
    (sum, p) => sum + Number(p.totalCost || 0),
    0
  )

  const totalPaid = data.reduce(
    (sum, p) => sum + Number(p.costPaid || 0),
    0
  )

  const totalRemaining = totalAmount - totalPaid

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))',
          gap: 20,
          marginBottom: 24
        }}
      >
        <div className="card" style={{ padding: 24 }}>
          <h4>إجمالي الصفحة</h4>

          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: '#2563eb'
            }}
          >
            {totalAmount.toLocaleString('ar-EG')} ج.م
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h4>المدفوع</h4>

          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: '#10b981'
            }}
          >
            {totalPaid.toLocaleString('ar-EG')} ج.م
          </div>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h4>المتبقي</h4>

          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: '#ef4444'
            }}
          >
            {totalRemaining.toLocaleString('ar-EG')} ج.م
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ marginBottom: 16 }}>
          المدفوعات
        </h3>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>المريض</th>
                <th>الهاتف</th>
                <th>الإجمالي</th>
                <th>مدفوع</th>
                <th>متبقي</th>
                <th>آخر زيارة</th>
              </tr>
            </thead>

            <tbody>
              {data.map((p) => {

                const remaining =
                  Number(p.totalCost || 0) -
                  Number(p.costPaid || 0)

                return (
                  <tr key={p._id}>
                    <td>
                      <strong>{p.fullName}</strong>
                    </td>

                    <td>{p.phone || '—'}</td>

                    <td>
                      {Number(p.totalCost || 0).toLocaleString('ar-EG')} ج.م
                    </td>

                    <td
                      style={{
                        color: '#10b981',
                        fontWeight: 700
                      }}
                    >
                      {Number(p.costPaid || 0).toLocaleString('ar-EG')} ج.م
                    </td>

                    <td
                      style={{
                        color: remaining > 0 ? '#ef4444' : '#10b981',
                        fontWeight: 700
                      }}
                    >
                      {remaining.toLocaleString('ar-EG')} ج.م
                    </td>

                    <td>
                      {p.visits?.length
                        ? new Date(
                            p.visits[p.visits.length - 1].visitDate
                          ).toLocaleDateString('ar-EG')
                        : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
              marginTop: '16px'
            }}
          >
            <button
              className="btn btn-secondary"
              disabled={page === 1}
              onClick={() => setPage(prev => prev - 1)}
            >
              السابق
            </button>

            <input
              type="number"
              min={1}
              max={pagination.totalPages}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const value = Number(pageInput)

                  if (value >= 1 && value <= pagination.totalPages) {
                    setPage(value)
                  }
                }
              }}
              onBlur={() => {
                const value = Number(pageInput)

                if (value >= 1 && value <= pagination.totalPages) {
                  setPage(value)
                } else {
                  setPageInput(String(page))
                }
              }}
              style={{
                width: 70,
                height: 38,
                border: '1px solid var(--border)',
                borderRadius: 8,
                textAlign: 'center',
                fontWeight: 600,
                fontSize: 15
              }}
            />

            <span style={{ fontWeight: 600 }}>
              من {pagination.totalPages}
            </span>

            <button
              className="btn btn-secondary"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(prev => prev + 1)}
            >
              التالي
            </button>
          </div>
        )}
      </div>
    </>
  )
}
function AppInner() {
  const { user, loading } = useAuth()
  const [screen, setScreen] = useState('landing')
  const [page, setPage] = useState('dashboard')

  // Always clear session on load - fresh start from landing
  useEffect(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }, [])

  useEffect(() => {
    if (loading) return
    if (!user && screen === 'app') setScreen('login')
  }, [user, loading])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>جارٍ التحميل...</p>
      </div>
    </div>
  )

  if (screen === 'landing') return (
    <Suspense fallback={<PageLoader />}>
      <Landing onEnterLogin={() => setScreen('login')} />
    </Suspense>
  )

  if (screen === 'login' || !user) return (
    <Suspense fallback={<PageLoader />}>
      <Login
        onBackToLanding={() => setScreen('landing')}
        onLogin={() => { setPage('dashboard'); setScreen('app') }}
      />
    </Suspense>
  )

  const role = normalizeRole(user.role)

  function renderPage() {
    // ── Admin ───────────────────────────────────────
    if (role === 'admin') {
      switch (page) {
        case 'dashboard': return <AdminDashboard onNavigate={setPage} />
        case 'patients': return <Patients />
        case 'doctors': return <AdminStaff mode="doctors" />
        case 'staff': return <AdminStaff mode="staff" />
        case 'debt': return <DebtAlerts />
        case 'payments': return <PaymentsList />
        case 'appointments': return <AppointmentsPage />
        case 'expenses': return <ExpensesPage />
        case 'reviews': return <ReviewsManagement />
        case 'profile': return <UserProfile />
        default: return <AdminDashboard onNavigate={setPage} />
      }
    }
    // ── Doctor ──────────────────────────────────────
    if (role === 'doctor') {
      switch (page) {
        case 'dashboard': return <DoctorDashboard />
        case 'patients': return <Patients />
        case 'appointments': return <AppointmentsPage />
        case 'profile': return <UserProfile />
        default: return <DoctorDashboard />
      }
    }
    // ── Receptionist ────────────────────────────────
    switch (page) {
      case 'dashboard': return <ReceptionistDashboard onNavigate={setPage} />
      case 'patients': return <Patients />
      case 'new-patient': return <Patients openCreateOnMount />
      case 'waiting-queue': return <WaitingQueue />
      case 'payments': return <PaymentsList />
      case 'appointments': return <AppointmentsPage />
      case 'expenses': return <ExpensesPage />
      case 'profile': return <UserProfile />
      default: return <ReceptionistDashboard onNavigate={setPage} />
    }
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Layout activePage={page} onNavigate={setPage} title={PAGE_TITLES[page] || 'لوحة التحكم'}>
        <Suspense fallback={<PageLoader />}>{renderPage()}</Suspense>
      </Layout>
    </Suspense>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppInner />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
