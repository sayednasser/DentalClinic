const BASE = import.meta.env.VITE_API_URL


function getToken() { return localStorage.getItem('accessToken') }
async function request(method, path, body = null) {
  const headers = {}

  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const opts = {
    method,
    headers
  }

  if (body) {
    if (body instanceof FormData) {
      opts.body = body
    } else {
      headers['Content-Type'] = 'application/json'
      opts.body = JSON.stringify(body)
    }
  }




  const res = await fetch(BASE + path, opts)

  const text = await res.text()
  const data = text ? JSON.parse(text) : {}

  if (res.status === 401) {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    window.location.reload()
    return
  }

  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`)
  }

  return data
}

const get = p => request('GET', p)
const post = (p, b) => request('POST', p, b)

const patch = (p, b) => request('PATCH', p, b)
const put = (p, b) => request('PUT', p, b)
const del = p => request('DELETE', p)

export const authAPI = {
  login: b => post('/auth/login', b),
  forgotPassword: b => patch('/auth/forgot-password', b),
  verifyForgot: b => patch('/auth/verify-forgot-password', b),
  resetForgot: b => patch('/auth/reset-forgot-password', b),
}
export const usersAPI = {
  getMe: () => get('/user'),

  logout: () => post('/user/logout'),
  updateProfilePic: file => {
    const formData = new FormData()
    formData.append('attachment', file)
    return patch('/user/profile-picture', formData)
  },
  updateProfile: data => post('/user/update-profile', data),

  updateCoverPic: file => {
    const formData = new FormData()
    formData.append('attachment', file)

    return patch('/user/profile-cover-picture', formData)
  },
  updatePassword: b => patch('/user/update-password', b),
  rotateToken: () => get('/user/rotate-token'),
  getShareLink: id => get(`/user/${id}/share`),
}
export const adminAPI = {
  createDoctor: b => post('/admin/doctors', b),
  createReception: b => post('/admin/receptions', b),
  getUsers: () => get('/admin/users'),
  getStats: () => get('/admin/stats'),
  getDashboard: () => get('/admin/dashboard'),
  getPatients: () => get('/admin/patients'),
  deleteUser: id => del(`/admin/users/${id}`),

  updateWorkingHours: (doctorId, workingHours) =>
    put(`/doctor/working-hours/${doctorId}`, {
      workingHours
    }),

  getIncome: (date) => get(`/admin/income?date=${date}`),
  getDoctorsPerf: () => get('/admin/doctors/performance'),
  getRevenue: () => get('/admin/analytics/revenue'),
  getDebtAlerts: (page = 1, limit = 20) =>
    get(`/admin/alerts/debt?page=${page}&limit=${limit}`),
  getRecentPayments: () => get('/admin/payments/recent'),
}
export const doctorAPI = {
  getAll: () => get('/doctor'),
  getDashboard: () => get('/doctor/dashboard'),
  getPatients: () => get('/doctor/patients'),
  getStats: () => get('/doctor/stats'),
  getProfile: () => get('/doctor/profile'),
  updateProfile: b => patch('/doctor/profile', b),
  completePatient: (patientId) => patch(`/doctor/patients/${patientId}/complete`)
}
export const patientsAPI = {
  create: b => post('/patient', b),

  getAll: (page = 1, limit = 20, search = "") => {

    if (typeof page === "object") {
      const params = page

      page = params.page || 1
      limit = params.limit || 20
      search = params.search || ""
    }

    return get(
      `/patient?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`
    )
  },

  getById: id => get(`/patient/${id}`),
  search: (keyword) => get(`/patient/search?keyword=${encodeURIComponent(keyword)}`),
  update: (id, b) => patch(`/patient/${id}`, b),
  delete: id => del(`/patient/${id}`),
  updateStatus: (id, b) => patch(`/patient/${id}/status`, b),
  updateDiagnosis: (id, b) => patch(`/patient/${id}/diagnosis`, b),
  updateTreatment: (id, b) => patch(`/patient/${id}/treatment`, b),
  updatePayment: (id, b) => patch(`/patient/${id}/payment`, b),
  increaseTotalCost: (id, addAmount) =>
    patch(`/patient/${id}/increase-total`, { addAmount }),
  addVisit: (id, b) => post(`/patient/${id}/visit`, b),
  followUp: (id) =>
    patch(`/patient/${id}/followup`),
  getImages: id => get(`/patient/${id}/images`),

  uploadImage: (id, file, caption) => {
    const formData = new FormData()
    formData.append('attachments', file)
    if (caption) formData.append('caption', caption)
    return post(`/patient/${id}/images`, formData)
  },

  deleteImage: (id, imageId) =>
    del(`/patient/${id}/images/${imageId}`),
}
export const expensesAPI = {
  getAll: () => get('/admin/expenses'),
  create: data => post('/admin/expenses', data),
  delete: id => del(`/admin/expenses/${id}`),
}
export const appointmentsAPI = {
  getByDoctor: (doctorId, date) =>
    get(`/appointment/doctor?doctorId=${doctorId}&date=${date}`),
  getMy: date =>
    get(`/appointment/my?date=${date}`),
  getAvailableSlots: (doctorId, date) => {
    console.log("API doctorId =", doctorId)
    console.trace("Called from")
    return get(`/appointment/available-slots?doctorId=${doctorId}&date=${date}`)
  },
  create: body =>
    post('/appointment', body),
  updateStatus: (id, status) =>
    patch(`/appointment/status/${id}`, { status }),
  reschedule: (id, body) =>
    patch(`/appointment/reschedule/${id}`, body),

  getToday: () =>
    get('/appointment/today'),

  getByPatient: patientId =>
    get(`/appointment/patient/${patientId}`),
}
export const reviewsAPI = {
  getAll: () => get('/review'),

  create: (data) => post('/review', data),

  getAdmin: () => get('/review/admin'),

  approve: (reviewId) =>
    patch(`/review/${reviewId}/approve`),

  delete: (reviewId) =>
    del(`/review/${reviewId}`)
}