import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { authAPI } from '../../api'
import { AR } from '../../utils/ar'
import { Eye, EyeOff, Activity, ArrowRight, Lock, Mail, KeyRound } from 'lucide-react'

export default function Login({ onLogin, onBackToLanding }) {
  const { login } = useAuth()
  const { toast } = useToast()
  const [step, setStep] = useState('login')
  const [loading, setLoading] = useState(false)

  const [showPwd, setShowPwd] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [form, setForm] = useState({ email: '', password: '', code: '', newPassword: '', confirmPassword: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    setForm({ email: '', password: '', code: '', newPassword: '', confirmPassword: '' })
    setStep('login')
  }, [])

  async function handleLogin(e) {
    e.preventDefault(); setLoading(true)
    try {
      const u = await login(form.email, form.password)
      toast(`أهلاً بك، ${u?.name || 'مستخدم'}!`, 'success')
      onLogin(u)
    } catch (err) { toast(err.message || 'بيانات دخول غير صحيحة', 'error') }
    finally { setLoading(false) }
  }
  async function handleForgot(e) {
    e.preventDefault(); setLoading(true)
    try {
      await authAPI.forgotPassword({ email: form.email })
      toast('تم إرسال كود التحقق إلى بريدك الإلكتروني', 'success')
      setStep('verify')
    } catch (err) { toast(err.message || 'فشل الإرسال', 'error') }
    finally { setLoading(false) }
  }
  async function handleVerify(e) {
    e.preventDefault(); setLoading(true)
    try {
      await authAPI.verifyForgot({ email: form.email, code: form.code })
      toast('تم التحقق بنجاح!', 'success'); setStep('reset')
    } catch (err) { toast(err.message || 'كود غير صحيح', 'error') }
    finally { setLoading(false) }
  }
  async function handleReset(e) {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) { toast(AR.noMatch, 'error'); return }
    setLoading(true)
    try {
      await authAPI.resetForgot({ email: form.email, code: form.code, password: form.newPassword, confirmPassword: form.confirmPassword })
      toast('تم تغيير كلمة المرور بنجاح! يرجى تسجيل الدخول.', 'success')
      setStep('login')
    } catch (err) { toast(err.message || 'فشلت الإعادة', 'error') }
    finally { setLoading(false) }
  }

  const inputStyle = { paddingRight: 40, paddingLeft: 14, background: 'rgba(255,255,255,.06)', border: '1.5px solid rgba(255,255,255,.1)', color: '#fff', direction: 'rtl', textAlign: 'right' }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #134e4a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(20,184,166,.12) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-15%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,.08) 0%, transparent 70%)' }} />
      </div>

      <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', backdropFilter: 'blur(20px)', borderRadius: 24, padding: '40px 36px', width: '100%', maxWidth: 420, position: 'relative', zIndex: 1, animation: 'fadeUp .4s ease' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#0d9488,#14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(20,184,166,.35)' }}>
            <Activity size={22} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: 'Cairo,sans-serif', fontSize: 22, fontWeight: 800, color: '#fff' }}>{AR.appName}</div>
            <div style={{ fontSize: 11, color: '#14b8a6', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' }}>نظام إدارة العيادة</div>
          </div>
          {onBackToLanding && (
            <button onClick={onBackToLanding} style={{ marginRight: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,.45)', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
              العودة <ArrowRight size={12} />
            </button>
          )}
        </div>

        {step === 'login' && (
          <form onSubmit={handleLogin}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 6 }}>{AR.welcomeBack}</h2>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 28 }}>سجّل دخولك إلى حسابك</p>
            <div className="input-group" style={{ marginBottom: 16 }}>
              <label style={{ color: '#94a3b8' }}>{AR.email}</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input className="input-field" type="email" placeholder="you@clinic.com" value={form.email} onChange={e => set('email', e.target.value)} required autoComplete="off" style={inputStyle} />
              </div>
            </div>
            <div className="input-group" style={{ marginBottom: 8 }}>
              <label style={{ color: '#94a3b8' }}>{AR.password}</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input className="input-field" type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} required autoComplete="new-password" style={{ ...inputStyle, paddingLeft: 44 }} />
                <button type="button" onClick={() => setShowPwd(s => !s)} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="button" onClick={() => setStep('forgot')} style={{ background: 'none', border: 'none', color: '#14b8a6', fontSize: 13, cursor: 'pointer', marginBottom: 24, fontWeight: 500 }}>
              {AR.forgotPassword}
            </button>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px 20px', fontSize: 15 }}>
              {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> جارٍ الدخول...</> : AR.signIn}
            </button>
          </form>
        )}

        {step === 'forgot' && (
          <form onSubmit={handleForgot}>
            <button type="button" onClick={() => setStep('login')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginBottom: 20, fontSize: 13 }}>
              <ArrowRight size={14} /> {AR.backToLogin}
            </button>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 6 }}>إعادة تعيين كلمة المرور</h2>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 28 }}>أدخل بريدك لاستلام كود التحقق</p>
            <div className="input-group" style={{ marginBottom: 24 }}>
              <label style={{ color: '#94a3b8' }}>{AR.email}</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input className="input-field" type="email" placeholder="you@clinic.com" value={form.email} onChange={e => set('email', e.target.value)} required style={inputStyle} />
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px 20px' }}>
              {loading ? 'جارٍ الإرسال...' : AR.sendCode}
            </button>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerify}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{AR.checkEmail}</h2>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 28 }}>أرسلنا كود التحقق إلى <strong style={{ color: '#fff' }}>{form.email}</strong></p>
            <div className="input-group" style={{ marginBottom: 24 }}>
              <label style={{ color: '#94a3b8' }}>كود التحقق</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={16} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input className="input-field" type="text" placeholder="أدخل الكود" value={form.code} onChange={e => set('code', e.target.value)} required style={{ ...inputStyle, letterSpacing: '.15em', textAlign: 'center', fontSize: 18 }} />
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px 20px' }}>
              {loading ? 'جارٍ التحقق...' : AR.verifyCode}
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleReset}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 6 }}>كلمة مرور جديدة</h2>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 28 }}>اختر كلمة مرور قوية</p>
            <div className="input-group" style={{ marginBottom: 16 }}>
              <label style={{ color: '#94a3b8' }}>{AR.newPassword}</label>

              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b'
                  }}
                />

                <input
                  className="input-field"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.newPassword}
                  onChange={e => set('newPassword', e.target.value)}
                  required
                  style={{ ...inputStyle, paddingLeft: 44 }}
                />

                <button
                  type="button"
                  onClick={() => setShowNewPassword(v => !v)}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="input-group" style={{ marginBottom: 24 }}>
              <label style={{ color: '#94a3b8' }}>{AR.confirmPassword}</label>

              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    right: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b'
                  }}
                />

                <input
                  className="input-field"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={e => set('confirmPassword', e.target.value)}
                  required
                  style={{ ...inputStyle, paddingLeft: 44 }}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(v => !v)}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '13px 20px' }}>
              {loading ? 'جارٍ الإعادة...' : AR.resetPassword}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
