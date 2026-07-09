// src/pages/appointments/AppointmentsPage.jsx
import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, CalendarDays } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { adminAPI, appointmentsAPI } from '../../api'
import AppointmentFilters from '../../components/appointments/AppointmentFilters'
import AppointmentTable from '../../components/appointments/AppointmentTable'
import AppointmentModal from '../../components/appointments/AppointmentModal'
import RescheduleModal from '../../components/appointments/RescheduleModal'

export default function AppointmentsPage() {
  const { toast: showToast } = useToast()
  const toast = useCallback((type, msg) => showToast(msg, type), [showToast])
  const { user } = useAuth()

  const isDoctor = user?.role === 'doctor' || user?.role === 2
  // ── Doctors ──────────────────────────────────────────
  const [doctors, setDoctors] = useState([])

  // ── Filters ──────────────────────────────────────────
  const [filterDoctorId, setFilterDoctorId] = useState('')
  const [filterDate, setFilterDate] = useState(
    () => new Date().toISOString().split('T')[0]
  )
  useEffect(() => {
    if (!isDoctor) return

    setFilterDoctorId(user?._id || user?.id)
  }, [isDoctor, user])

  // ── Appointments ─────────────────────────────────────
  const [appointments, setAppointments] = useState([])
  const [aptLoading, setAptLoading] = useState(false)
  const [aptError, setAptError] = useState(null)
  const [searched, setSearched] = useState(false)

  // ── Modals ───────────────────────────────────────────
  const [showNew, setShowNew] = useState(false)
  const [rescheduleTarget, setRescheduleTarget] = useState(null)

  useEffect(() => {
    if (isDoctor) return

    adminAPI.getUsers()
      .then(res => {
        const all = Array.isArray(res) ? res : res?.data || []
        const docs = all.filter(u => u.role === 2 || u.role === 'doctor')
        setDoctors(docs)
      })
      .catch(() => setDoctors([]))
  }, [isDoctor])

  const fetchAppointments = useCallback(async () => {
    if (!filterDoctorId || !filterDate) return
    setAptLoading(true)
    setAptError(null)
    setSearched(true)
    try {
      const res = await appointmentsAPI.getByDoctor(filterDoctorId, filterDate)
      setAppointments(Array.isArray(res) ? res : res?.data || [])
    } catch (err) {
      setAptError(err.message || 'فشل تحميل المواعيد')
      setAppointments([])
    } finally {
      setAptLoading(false)
    }
  }, [filterDoctorId, filterDate])

  useEffect(() => {
    if (isDoctor && filterDoctorId) {
      fetchAppointments()
    }
  }, [isDoctor, filterDoctorId, filterDate, fetchAppointments])
  // Stats
  const stats = useMemo(() => {
    if (!appointments.length) return null

    return {
      total: appointments.length,

      scheduled: appointments.filter(
        a => a.status === 'scheduled'
      ).length,

      completed: appointments.filter(
        a => a.status === 'completed'
      ).length,

      cancelled: appointments.filter(
        a => a.status === 'cancelled'
      ).length,

      noShow: appointments.filter(
        a => a.status === 'no_show'
      ).length,

      revenue: appointments
        .filter(a => a.status === 'completed')
        .reduce(
          (s, a) => s + Number(a.totalCost || 0),
          0
        ),
    }
  }, [appointments])

  const handleNewSuccess = useCallback(() => {
    setShowNew(false)
    if (searched) fetchAppointments()
  }, [searched, fetchAppointments])

  const handleRescheduleSuccess = useCallback(() => {
    setRescheduleTarget(null)
    if (searched) fetchAppointments()
  }, [searched, fetchAppointments])


  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 14, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--clinic-teal), var(--clinic-teal-2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(13,148,136,.3)',
          }}>
            <CalendarDays size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-main)' }}>إدارة المواعيد</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              جدولة ومتابعة مواعيد المرضى
            </p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNew(true)} type="button">
          <Plus size={16} />
          موعد جديد
        </button>
      </div>

      {/* Stats */}
      {searched && stats && !aptLoading && (
        <div className="apt-stats-grid">
          {[
            { label: 'إجمالي المواعيد', value: stats.total, bg: 'var(--primary-50)', color: 'var(--primary-700)' },
            { label: 'مجدول', value: stats.scheduled, bg: '#dbeafe', color: '#1d4ed8' },
            { label: 'مكتمل', value: stats.completed, bg: '#dcfce7', color: '#15803d' },
            { label: 'ملغي', value: stats.cancelled, bg: '#fee2e2', color: '#dc2626' },
            { label: 'لم يحضر', value: stats.noShow, bg: '#fef3c7', color: '#d97706' },
            { label: 'الإيراد المكتمل', value: `${stats.revenue.toLocaleString('ar-EG')} ج.م`, bg: 'var(--clinic-mint)', color: 'var(--clinic-teal)' },
          ].map(s => (
            <div key={s.label} style={{
              background: s.bg,
              border: `1px solid ${s.color}22`,
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Main card */}
      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        <AppointmentFilters
          doctors={doctors}
          doctorId={filterDoctorId}
          date={filterDate}
          hideDoctor={isDoctor}
          onDoctorChange={setFilterDoctorId}
          onDateChange={setFilterDate}
          onSearch={fetchAppointments}
        />
        {!isDoctor && !searched && !aptLoading ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-muted)' }}>
            <CalendarDays size={40} style={{ margin: '0 auto 14px', display: 'block', opacity: .25 }} />
            <p style={{ fontSize: 14 }}>اختر طبيباً وتاريخاً ثم اضغط «بحث» لعرض المواعيد</p>
          </div>
        ) : (
          <AppointmentTable
            appointments={appointments}
            loading={aptLoading}
            error={aptError}
            onReschedule={(apt) => {
              setRescheduleTarget(apt)
            }}
            onStatusChange={fetchAppointments}
            toast={toast}
          />
        )}
      </div>

      {/* Modals */}
      {showNew && (
        <AppointmentModal
          doctors={doctors}
          onClose={() => setShowNew(false)}
          onSuccess={handleNewSuccess}
          toast={toast}
        />
      )}

      {rescheduleTarget && (
        <RescheduleModal
          appointment={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onSuccess={handleRescheduleSuccess}
          toast={toast}
        />
      )}
    </div>
  )
}
