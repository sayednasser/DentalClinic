import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { normalizeRole } from '../../utils/roles'
import { usePatients } from './hooks/usePatients'
import PatientFilters from './PatientFilters'
import PatientsTable from './PatientsTable'
import PatientDetails from './pages/PatientDetails'
import CreatePatientModal from './modals/CreatePatientModal'
import EditPatientModal from './modals/EditPatientModal'
import PaymentModal from './modals/PaymentModal'
import FollowUpVisitModal from './modals/FollowUpVisitModal'
import PatientAppointmentModal from './modals/PatientAppointmentModal'

function getPatientIdFromUrl() {
  const m = window.location.pathname.match(/^\/patients\/([^/]+)/)
  return m ? m[1] : null
}

export default function PatientsPage({ openCreateOnMount = false }) {
  const { user } = useAuth()
  const role = normalizeRole(user?.role)
  
  const canEdit = role === 'admin' || role === 'receptionist'
  const canCreate = role === 'admin' || role === 'receptionist'
  const canDelete = role === 'admin'


  const {
    doctors, loading, search, setSearch,
    filtered, load, handleDelete, handleStatus,
  } = usePatients()

  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [appointmentPatient, setAppointmentPatient] = useState(null)
  const [viewingId, setViewingId] = useState(() => getPatientIdFromUrl())

  useEffect(() => {
    if (openCreateOnMount) setModal('create')
  }, [openCreateOnMount])

  // Keep the details view in sync with browser back/forward.
  useEffect(() => {
    function onPopState() { setViewingId(getPatientIdFromUrl()) }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const openView = useCallback((p) => {
    const id = p._id || p.id
    setSelected(p)
    setViewingId(id)
    window.history.pushState({}, '', `/patients/${id}`)
  }, [])

  const closeView = useCallback(() => {
    setViewingId(null)
    setSelected(null)
    window.history.pushState({}, '', '/patients')
  }, [])

  function openCreate() { setModal('create') }
  function openEdit(p) { setSelected(p); setModal('edit') }
  function openPay(p) { setSelected(p); setModal('payment') }
  function openFollowUp(p) { setSelected(p); setModal('followup') }
  function openAppointments(p) {
    setAppointmentPatient(p)
  } function closeModal() { setModal(null) }

  // Direct load of /patients/:id (refresh, shared link) — the row data isn't
  // available yet, so PatientDetails fetches it itself via patientId.
  if (viewingId) {
    return (
      <PatientDetails
        patientId={viewingId}
        initialPatient={selected && (selected._id || selected.id) === viewingId ? selected : null}
        doctors={doctors}
        role={role}
        canEdit={canEdit}
        canDelete={canDelete}
        onBack={closeView}
        onDeleted={() => { closeView(); load() }}
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PatientFilters
        search={search}
        onSearchChange={setSearch}
        onRefresh={load}
        loading={loading}
        canCreate={canCreate}
        onCreate={openCreate}
      />

      <PatientsTable
        patients={filtered}
        loading={loading}
        search={search}
        role={role}
        canEdit={canEdit}
        canDelete={canDelete}
        canCreate={canCreate}
        onCreate={openCreate}
        onView={openView}
        onEdit={openEdit}
        onPayment={openPay}
        onFollowUp={openFollowUp}
        onAppointments={openAppointments}
        onDelete={handleDelete}
        onStatusChange={handleStatus}
      />

      {modal === 'create' && (
        <CreatePatientModal doctors={doctors} onClose={closeModal} onSaved={load} />
      )}

      {modal === 'edit' && selected && (
        <EditPatientModal patient={selected} doctors={doctors} onClose={closeModal} onSaved={load} />
      )}

      {modal === 'payment' && selected && (
        <PaymentModal patient={selected} onClose={closeModal} onSaved={load} />
      )}

      {modal === 'followup' && selected && (
        <FollowUpVisitModal patient={selected} doctors={doctors} onClose={closeModal} onSaved={load} />
      )}
      {appointmentPatient && (
        <PatientAppointmentModal
          patient={appointmentPatient}
          doctorId={
            typeof appointmentPatient.doctorId === 'object'
              ? appointmentPatient.doctorId?._id
              : appointmentPatient.doctorId
          }
          onClose={() => setAppointmentPatient(null)}
          onSaved={() => {
            setAppointmentPatient(null)
            load()
          }}
        />
      )}
    </div>
  )
}
