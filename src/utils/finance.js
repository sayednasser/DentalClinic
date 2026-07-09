// ── Finance calculation utilities ─────────────────────────────────

export const DOCTOR_SHARE_PERCENT = 40 // doctor gets 40% of revenue

// Get today's date boundaries
export function todayBounds() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)

  const end = new Date()
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

// Get current month boundaries
export function monthBounds() {
  const now = new Date()

  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  )

  const end = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  )

  return { start, end }
}

// Filter patients by date range using visitDate or createdAt
export function filterByDate(
  patients,
  start,
  end,
  dateField = 'visitDate'
) {
  return patients.filter(p => {
    const raw = p[dateField] || p.createdAt

    if (!raw) return false

    const d = new Date(raw)

    return d >= start && d <= end
  })
}

// Calculate revenue
// لو بعت start/end هيحسب المدفوعات خلال الفترة من payment[]
// لو مبعتش هيحسب إجمالي المدفوع costPaid
export function calcRevenue(
  patients,
  start = null,
  end = null
) {
  // Revenue for period based on payments history
  if (start && end) {
    return patients.reduce((total, patient) => {
      const payments = Array.isArray(patient.payment)
        ? patient.payment
        : []

      const patientRevenue = payments.reduce((sum, pay) => {
        const paymentDate = new Date(pay.createdAt)

        if (
          paymentDate >= start &&
          paymentDate <= end
        ) {
          return sum + Number(pay.amount || 0)
        }

        return sum
      }, 0)

      return total + patientRevenue
    }, 0)
  }

  // All time revenue
  return patients.reduce(
    (sum, p) => sum + Number(p.costPaid || 0),
    0
  )
}

// Calculate total cost (what should be paid)
export function calcTotalCost(patients) {
  return patients.reduce(
    (sum, p) => sum + Number(p.totalCost || 0),
    0
  )
}

// Calculate remaining debt
export function calcDebt(patients) {
  return patients.reduce((sum, p) => {
    const remaining =
      Number(p.totalCost || 0) -
      Number(p.costPaid || 0)

    return sum + (remaining > 0 ? remaining : 0)
  }, 0)
}

// Calculate doctor share
export function calcDoctorShare(
  patients,
  percent = DOCTOR_SHARE_PERCENT,
  start = null,
  end = null
) {
  const revenue = calcRevenue(
    patients,
    start,
    end
  )

  return Math.round(
    revenue * percent / 100
  )
}

// ── Expenses storage (localStorage) ─────────────────────────────────

const EXPENSES_KEY = 'clinic_expenses'

export function getExpenses() {
  try {
    return JSON.parse(
      localStorage.getItem(EXPENSES_KEY) || '[]'
    )
  } catch {
    return []
  }
}

export function saveExpenses(expenses) {
  localStorage.setItem(
    EXPENSES_KEY,
    JSON.stringify(expenses)
  )
}

export function getMonthExpenses(year, month) {
  return getExpenses().filter(e => {
    const d = new Date(e.date)

    return (
      d.getFullYear() === year &&
      d.getMonth() === month
    )
  })
}

export function getTodayExpenses() {
  const today = new Date()
    .toISOString()
    .slice(0, 10)

  return getExpenses().filter(
    e => e.date === today
  )
}

export function sumExpenses(expenses) {
  return expenses.reduce(
    (sum, e) => sum + Number(e.amount || 0),
    0
  )
}