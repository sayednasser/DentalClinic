export function getToday() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

export function createEmptyCreateForm() {
  return {
    fullName: '',
    phone: '',
    address: '',
    age: '',
    gender: '',
    notes: '',
    doctorId: '',
    totalCost: '',
    costPaid: '',
    visitDate: getToday(),
  }
}

export function validateCreatePatient(form) {
  const e = {}

  if (!form.fullName.trim()) e.fullName = 'مطلوب'
  if (!form.address.trim()) e.address = 'مطلوب'
  if (!form.gender) e.gender = 'مطلوب'
  if (!form.totalCost) e.totalCost = 'مطلوب'
  if (form.costPaid === '') e.costPaid = 'مطلوب'
  if (!form.doctorId) e.doctorId = 'مطلوب'

  return e
}