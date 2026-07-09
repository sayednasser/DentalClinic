import { useEffect, useState, useMemo } from 'react'
import { expensesAPI } from '../../api'
import { useToast } from '../../context/ToastContext'
import {
  Wallet, Search, Calendar, ListFilter, Banknote,
  ChevronRight, ChevronLeft, RefreshCw
} from 'lucide-react'

const EXPENSE_CATEGORIES = [
  'رواتب', 'إيجار', 'مستلزمات طبية', 'كهرباء وماء', 'صيانة', 'تسويق', 'أخرى'
]

const PAGE_SIZE = 20

function Sk({ h = 28, w = '100%', r = 6 }) {
  return <div style={{ height: h, width: w, background: 'var(--border)', borderRadius: r, opacity: .5 }} />
}

function SummaryCard({ icon: Icon, value, label, accent, accentBg, loading }) {
  return (
    <div className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
      <div
        style={{
          width: 44, height: 44, borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: accentBg, color: accent, flexShrink: 0
        }}
      >
        <Icon size={20} />
      </div>
      <div style={{ minWidth: 0 }}>
        {loading ? <Sk h={26} w={110} /> : (
          <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
        )}
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
      </div>
    </div>
  )
}

const CURR = (n) => `${Number(n || 0).toLocaleString('ar-EG')} ج.م`

export default function ExpensesPage() {
  const { toast } = useToast()
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('الكل')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)

  async function load() {
    setLoading(true)
    try {
      const res = await expensesAPI.getAll()
      setExpenses(Array.isArray(res) ? res : res?.data || [])
    } catch {
      toast('فشل تحميل المصروفات', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // ── إعادة الصفحة للأولى عند تغيير أي فلتر ─────────────────────────
  useEffect(() => {
    setPage(1)
  }, [search, category, dateFrom, dateTo])

  // ── ملخص عام (يُحسب من كل المصروفات بدون فلترة) ───────────────────
  const totalExpenses = useMemo(
    () => expenses.reduce((s, e) => s + Number(e.amount || 0), 0),
    [expenses]
  )

  const monthExpenses = useMemo(() => {
    const now = new Date()
    return expenses
      .filter(e => {
        const d = new Date(e.date)
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      })
      .reduce((s, e) => s + Number(e.amount || 0), 0)
  }, [expenses])

  const expensesCount = expenses.length

  // ── البحث + الفلترة ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase()
    const from = dateFrom ? new Date(dateFrom) : null
    const to = dateTo ? new Date(dateTo + 'T23:59:59') : null

    return expenses.filter(e => {
      if (kw) {
        const desc = (e.description || '').toLowerCase()
        const cat = (e.category || '').toLowerCase()
        if (!desc.includes(kw) && !cat.includes(kw)) return false
      }

      if (category !== 'الكل' && e.category !== category) return false

      if (from || to) {
        const d = new Date(e.date)
        if (from && d < from) return false
        if (to && d > to) return false
      }

      return true
    })
  }, [expenses, search, category, dateFrom, dateTo])

  // ── Pagination ──────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, currentPage])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Header actions ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={load} disabled={loading}>
          <RefreshCw size={14} style={{ animation: loading ? 'spin .7s linear infinite' : 'none' }} />
          تحديث
        </button>
      </div>

      {/* ── Summary cards ────────────────────────────────────────────── */}
      <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20 }}>
        <SummaryCard
          loading={loading}
          icon={Wallet}
          value={CURR(totalExpenses)}
          label="إجمالي المصروفات"
          accent="var(--clinic-coral)"
          accentBg="rgba(251,113,133,.12)"
        />
        <SummaryCard
          loading={loading}
          icon={Calendar}
          value={CURR(monthExpenses)}
          label="مصروفات الشهر الحالي"
          accent="var(--clinic-teal)"
          accentBg="var(--clinic-mint)"
        />
        <SummaryCard
          loading={loading}
          icon={Banknote}
          value={expensesCount}
          label="عدد المصروفات"
          accent="var(--clinic-gold)"
          accentBg="rgba(245,158,11,.12)"
        />
      </div>

      {/* ── Search + Filters ─────────────────────────────────────────── */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <ListFilter size={16} />
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>البحث والفلترة</h3>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
            gap: 14
          }}
        >
          <div className="input-group">
            <label>بحث</label>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="input-field"
                style={{ paddingRight: 34 }}
                placeholder="بحث بالوصف أو الفئة..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label>الفئة</label>
            <select className="input-field" value={category} onChange={e => setCategory(e.target.value)}>
              <option value="الكل">الكل</option>
              {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="input-group">
            <label>من تاريخ</label>
            <input
              className="input-field"
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>إلى تاريخ</label>
            <input
              className="input-field"
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>سجل المصروفات</h3>
          <span className="badge badge-blue">{filtered.length} نتيجة</span>
        </div>

        {loading ? (
          <Sk h={200} r={10} />
        ) : filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: '30px 0' }}>
            <Banknote size={32} />
            <p>لا توجد مصروفات مطابقة</p>
          </div>
        ) : (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>الوصف</th>
                    <th>الفئة</th>
                    <th>التاريخ</th>
                    <th>المبلغ</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((e, i) => (
                    <tr key={e.id || e._id || i}>
                      <td style={{ fontWeight: 600 }}>{e.description}</td>
                      <td><span className="badge badge-blue">{e.category}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                        {e.date ? new Date(e.date).toLocaleDateString('ar-EG') : '—'}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--clinic-coral)' }}>{CURR(e.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ─────────────────────────────────────────── */}
            {totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  marginTop: 18
                }}
              >
                <button
                  className="icon-btn"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  style={{ opacity: currentPage <= 1 ? .4 : 1 }}
                >
                  <ChevronRight size={16} />
                </button>

                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  صفحة {currentPage} من {totalPages}
                </span>

                <button
                  className="icon-btn"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  style={{ opacity: currentPage >= totalPages ? .4 : 1 }}
                >
                  <ChevronLeft size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
