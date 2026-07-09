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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.getDebtAlerts()
      .then(res => {
        setData(Array.isArray(res) ? res : res.data || [])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  const totalDebt = data.reduce(
    (sum, p) => sum + Number(p.debt || p.remainingAmount || 0),
    0
  )

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
          gap: 20,
          marginBottom: 24
        }}
      >
        <div className="card" style={{ padding: 24 }}>
          <h4
            style={{
              color: 'var(--text-muted)',
              marginBottom: 10
            }}
          >
            إجمالي الديون المتأخرة
          </h4>

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
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
          الديون المتأخرة
        </h3>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>المريض</th>
                <th>الهاتف</th>
                <th>الديون</th>
              </tr>
            </thead>

            <tbody>
              {data.map((r, i) => (
                <tr key={i}>
                  <td>
                    <strong>
                      {r.patientName || r.name || r.fullName}
                    </strong>
                  </td>

                  <td>{r.phone || '—'}</td>

                  <td>
                    <span className="badge badge-red">
                      {Number(
                        r.debt || r.remainingAmount || 0
                      ).toLocaleString('ar-EG')} ج.م
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

  useEffect(() => {
    patientsAPI.getAll()
      .then(res => {
        setData(Array.isArray(res) ? res : res.data || [])
      })
      .finally(() => setLoading(false))
  }, [])

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
      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}
      >
        <div className="card" style={{ padding: 24 }}>
          <h4 style={{ color: '#64748b', marginBottom: 10 }}>
            الإجمالي الكلي
          </h4>

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
          <h4 style={{ color: '#64748b', marginBottom: 10 }}>
            إجمالي المدفوع
          </h4>

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
          <h4 style={{ color: '#64748b', marginBottom: 10 }}>
            إجمالي المتبقي
          </h4>

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

      {/* Table */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
          المدفوعات
        </h3>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>المريض</th>
                <th>الهاتف</th>
                <th>تاريخ الزيارة</th>
                <th>الإجمالي</th>
                <th>مدفوع</th>
                <th>متبقي</th>
              </tr>
            </thead>

            <tbody>
              {data.map((r, i) => {
                const rem =
                  Number(r.totalCost || 0) -
                  Number(r.costPaid || 0)
                return (
                  <tr key={i}>

                    <td><strong>{r.fullName || r.name}</strong></td>
                    <td>{r.phone || '—'}</td>
                    <td>
                      {r.visits?.length ? new Date(r.visits[r.visits.length - 1].visitDate).toLocaleDateString('ar-EG') : '—'}
                    </td>

                    <td>
                      {Number(r.totalCost || 0).toLocaleString('ar-EG')} ج.م
                    </td>

                    <td
                      style={{
                        color: '#10b981',
                        fontWeight: 600
                      }}
                    >
                      {Number(r.costPaid || 0).toLocaleString('ar-EG')} ج.م
                    </td>

                    <td
                      style={{
                        color: rem > 0 ? '#ef4444' : '#10b981',
                        fontWeight: 600
                      }}
                    >
                      {rem.toLocaleString('ar-EG')} ج.م
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
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
