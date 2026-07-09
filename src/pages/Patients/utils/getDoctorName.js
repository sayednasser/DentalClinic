// Same fallback chain used previously inline inside DoctorSelect / view modal.
export function getDoctorName(doctor) {
  if (!doctor) return ''
  return (
    [doctor.firstName, doctor.middleName, doctor.lastName].filter(Boolean).join(' ') ||
    doctor.fullName ||
    doctor.name ||
    doctor.userName ||
    doctor.email ||
    ''
  )
}

export function findDoctorById(doctors, id) {
  return (doctors || []).find(d => (d._id || d.id) === id)
}
