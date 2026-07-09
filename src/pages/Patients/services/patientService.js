import { patientsAPI, adminAPI } from '../../../api'

export const patientService = {
  async getAll() {
    const res = await patientsAPI.getAll()
    return Array.isArray(res) ? res : res?.data || []
  },
followUp(id) {
  return patientsAPI.followUp(id)
},
  async getDoctors() {
    const res = await adminAPI.getUsers().catch(() => ({ data: [] }))
    const all = Array.isArray(res) ? res : res?.data || []
    return all.filter(u => Number(u.role) === 2)
  },

  create(payload) {
    return patientsAPI.create(payload)
  },

  update(id, payload) {
    return patientsAPI.update(id, payload)
  },

  delete(id) {
    return patientsAPI.delete(id)
  },

  updateStatus(id, payload) {
    return patientsAPI.updateStatus(id, payload)
  },

  updateDiagnosis(id, payload) {
    return patientsAPI.updateDiagnosis(id, payload)
  },

  updateTreatment(id, payload) {
    return patientsAPI.updateTreatment(id, payload)
  },

  updatePayment(id, payload) {
    return patientsAPI.updatePayment(id, payload)
  },

  increaseTotalCost(id, amount) {
    return patientsAPI.increaseTotalCost(id, amount)
  },

  async getById(id) {
    const res = await patientsAPI.getById(id)
    return res?.data || res
  },

  addVisit(id, payload) {
    return patientsAPI.addVisit(id, payload)
  },

  async getImages(id) {
    const res = await patientsAPI.getImages(id).catch(() => [])
    return Array.isArray(res) ? res : res?.data || []
  },

uploadImage(id, file, caption) {
  return patientsAPI.uploadImage(id, file, caption);
},
  deleteImage(id, imageId) {
    return patientsAPI.deleteImage(id, imageId)
  },

  async getAppointments(id) {
    const { appointmentsAPI } = await import('../../../api')
    const res = await appointmentsAPI.getByPatient(id).catch(() => [])
    return Array.isArray(res) ? res : res?.data || []
  },
}
