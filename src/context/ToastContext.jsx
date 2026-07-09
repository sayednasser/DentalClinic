import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const toast = useCallback((message, type='info') => {
    const id = Date.now()
    setToasts(t=>[...t,{id,message,type}])
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)), 3500)
  }, [])
  const remove = id => setToasts(t=>t.filter(x=>x.id!==id))
  const icons  = { success:CheckCircle, error:XCircle, info:Info }
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-container">
        {toasts.map(t => {
          const Icon = icons[t.type]||Info
          return (
            <div key={t.id} className={`toast ${t.type}`}>
              <Icon size={18}/>
              <span style={{ flex:1 }}>{t.message}</span>
              <button onClick={()=>remove(t.id)} style={{ background:'none', border:'none', color:'#94a3b8', cursor:'pointer' }}><X size={14}/></button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
export const useToast = () => useContext(ToastContext)
