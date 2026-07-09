import { useCallback, useEffect, useState } from 'react'
import { useToast } from '../../../context/ToastContext'
import { patientService } from '../services/patientService'

export function usePatients() {
  const { toast } = useToast()
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [p, d] = await Promise.allSettled([patientService.getAll(), patientService.getDoctors()])
      if (p.status === 'fulfilled') setPatients(p.value)
      if (d.status === 'fulfilled') setDoctors(d.value)
    } catch {
      toast('فشل تحميل البيانات', 'error')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { load() }, [load])

  async function handleDelete(p) {
    if (!confirm(`حذف "${p.fullName || p.name}"؟`)) return
    try {
      await patientService.delete(p._id || p.id)
      toast('تم الحذف', 'success')
      await load()
    } catch (err) {
      toast(err.message || 'فشل الحذف', 'error')
    }
  }

  async function handleStatus(p, status) {
    setPatients(prev => prev.map(pt => (pt._id || pt.id) === (p._id || p.id) ? { ...pt, status } : pt))
    try {
      await patientService.updateStatus(p._id || p.id, { status })
      toast('تم تحديث الحالة', 'success')
    } catch (err) {
      toast(err.message || 'فشل', 'error')
      await load()
    }
  }

  const filtered = patients.filter(p =>
    (p.fullName || p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.phone || '').includes(search)
  )

  return {
    patients,
    setPatients,
    doctors,
    loading,
    search,
    setSearch,
    filtered,
    load,
    handleDelete,
    handleStatus,
  }
}
