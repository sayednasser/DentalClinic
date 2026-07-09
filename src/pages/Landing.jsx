import { useState, useEffect } from 'react'
import { FaWhatsapp } from 'react-icons/fa'
import {
  Star, Shield, Clock, Phone,
  MapPin, Mail, CheckCircle, Users, Award, Smile, Activity, ArrowLeft,
  Heart, Zap, Menu, X
} from 'lucide-react'
import { reviewsAPI } from '../api'
import { useToast } from '../context/ToastContext'

function ToothIcon({ size = 24, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 5 C22 5 13 11 12 21 C11 29 13 35 15 40 C17 45 17 51 19 57 C20 61 23 63 26 60 C28 57 29 50 31 46 C32 43 32 43 33 46 C35 50 36 57 38 60 C41 63 44 61 45 57 C47 51 47 45 49 40 C51 35 53 29 52 21 C51 11 42 5 32 5Z" fill={color} opacity="0.95" />
      <path d="M32 16 C30 22 30 30 32 37 C34 30 34 22 32 16Z" fill={color} opacity="0.28" />
    </svg>
  )
}

// ── Data (English var names, Arabic text content) ─────────────────
const CLINIC_NAME = 'عيادة ابتسامة مشرقة'

const SERVICES = [
  { icon: Smile, title: 'تبييض الأسنان', desc: 'تبييض احترافي لابتسامة مشرقة وواثقة في جلسة واحدة فقط.' },
  { icon: Shield, title: 'زراعة الأسنان', desc: 'استبدال دائم للأسنان يبدو ويشعر ويعمل مثل الأسنان الطبيعية.' },
  { icon: Zap, title: 'تقويم الأسنان', desc: 'تقويم تقليدي وشفاف لتقويم الأسنان وتحسين الإطباق.' },
  { icon: Heart, title: 'العناية الوقائية', desc: 'تنظيف وفحص دوري للحفاظ على صحة أسنانك مدى الحياة.' },
  { icon: Award, title: 'طب أسنان تجميلي', desc: 'قشرة بورسلين وحشوات وتجميل الابتسامة المصمم خصيصاً لك.' },
  { icon: Activity, title: 'علاج العصب', desc: 'علاج قنوات الجذر بلا ألم للحفاظ على أسنانك الطبيعية.' },

]

const STATS = [
  { value: '+12', label: 'سنة خبرة' },
  { value: '+8000', label: 'مريض سعيد' },
  // { value: '15', label: 'طبيب متخصص' },
  { value: '98%', label: 'معدل الرضا' },
]

const CONTACT_ITEMS = [
  { icon: Phone, label: 'اتصل بنا', value: '01140212417', link: 'tel:01140212417' },
  { icon: Mail, label: 'راسلنا', value: 'sayed01116343586@gmail.com', link: 'mailto:sayed01116343586@gmail.com' },
  { icon: MapPin, label: 'زورنا', value: ' دهشور', link: 'https://maps.app.goo.gl/TUvd6J81zXtmRNWG9' },
  { icon: Clock, label: 'مواعيد العمل', value: 'السبت – الخميس : 9ص – 9م' },
]

const NAV_LINKS = [
  { label: 'الخدمات', id: 'services' },
  { label: 'من نحن', id: 'about' },
  { label: 'آراء المرضى', id: 'testimonials' },
  { label: 'تواصل معنا', id: 'contact' },
]

// ── Star picker for the review submission modal ───────────────────
function StarPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
        >
          <Star size={22} fill={n <= value ? '#f59e0b' : 'none'} color="#f59e0b" />
        </button>
      ))}
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────
export default function Landing({ onEnterLogin }) {
  const [navOpen, setNavOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { toast } = useToast()

  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' })

  useEffect(() => {
    reviewsAPI.getAll()
      .then(res => {
        const data = Array.isArray(res) ? res : res?.data || []
        const approved = data.filter(r => (r.status ? r.status === 'approved' : r.approved !== false))
        setReviews(approved)
      })
      .catch(() => { })
      .finally(() => setReviewsLoading(false))
  }, [])

  async function handleReviewSubmit(e) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      await reviewsAPI.create({
        name: reviewForm.name,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      })
      toast('تم إرسال تقييمك', 'success')
      setReviewForm({ name: '', rating: 5, comment: '' })
      setShowReviewModal(false)
    } catch {
      toast('حدث خطأ أثناء إرسال التقييم', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setNavOpen(false)
  }

  const F = "Cairo, Tajawal, sans-serif"

  return (
    <div style={{ fontFamily: F, color: '#1e293b', overflowX: 'hidden', direction: 'rtl' }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, right: 0, left: 0, zIndex: 1000,
        padding: '0 5%', height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(255,255,255,.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,.06)' : 'none',
        transition: 'all .3s ease',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg,#0d9488,#14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(20,184,166,.4)' }}>
            <ToothIcon size={22} color="#fff" />
          </div>
          <span style={{ fontFamily: F, fontSize: 20, fontWeight: 800, color: scrolled ? '#1e293b' : '#fff' }}>
            {CLINIC_NAME}
          </span>
        </div>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="desktop-nav">
          {NAV_LINKS.map(({ label, id }) => (
            <button key={id} onClick={() => scrollTo(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: scrolled ? '#475569' : 'rgba(255,255,255,.85)', fontFamily: F, transition: 'color .2s' }}>
              {label}
            </button>
          ))}
          <button onClick={onEnterLogin} style={{ padding: '9px 22px', borderRadius: 99, background: '#0d9488', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: F, boxShadow: '0 4px 14px rgba(13,148,136,.4)', transition: 'transform .15s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            تسجيل دخول الموظفين
          </button>
        </div>

        {/* Hamburger */}
        <button onClick={() => setNavOpen(o => !o)} className="mobile-hamburger"
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: scrolled ? '#1e293b' : '#fff' }}>
          {navOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {navOpen && (
        <div style={{ position: 'fixed', top: 68, right: 0, left: 0, zIndex: 999, background: '#fff', padding: '16px 24px 24px', boxShadow: '0 8px 32px rgba(0,0,0,.12)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_LINKS.map(({ label, id }) => (
            <button key={id} onClick={() => scrollTo(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600, color: '#475569', textAlign: 'right', padding: '12px 0', borderBottom: '1px solid #f1f5f9', fontFamily: F }}>
              {label}
            </button>
          ))}
          <button onClick={onEnterLogin} style={{ marginTop: 12, padding: '13px 0', borderRadius: 12, background: '#0d9488', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 700, fontFamily: F }}>
            تسجيل دخول الموظفين ←
          </button>
        </div>
      )}

      {/* ── Hero ── */}
      <section style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 45%,#0d4a45 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 5% 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(20,184,166,.18) 0%,transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: '5%', left: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,.14) 0%,transparent 70%)' }} />
          <svg width="100%" height="100%" style={{ opacity: .04, position: 'absolute', inset: 0 }}>
            <defs><pattern id="hero-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.5" fill="#fff" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#hero-dots)" />
          </svg>
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 780 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', borderRadius: 99, marginBottom: 28, background: 'rgba(20,184,166,.15)', border: '1px solid rgba(20,184,166,.3)', color: '#2dd4bf', fontSize: 13, fontWeight: 700, fontFamily: F }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#14b8a6', display: 'inline-block' }} />
            العيادة الأولى في القاهرة
          </div>

          <h1 style={{ fontFamily: F, fontSize: 'clamp(36px,7vw,72px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 22 }}>
            ابتسامتك المثالية{' '}
            <span style={{ background: 'linear-gradient(90deg,#14b8a6,#2dd4bf,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              تبدأ هنا
            </span>
          </h1>

          <p style={{ fontSize: 'clamp(15px,2vw,18px)', color: 'rgba(255,255,255,.7)', lineHeight: 1.8, margin: '0 auto 40px', maxWidth: 540, fontFamily: F }}>
            رعاية أسنان متقدمة بلمسة لطيفة. من التنظيف الروتيني إلى التجميل الكامل — نحن هنا في كل خطوة من رحلتك.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => scrollTo('contact')} style={{ padding: '15px 36px', borderRadius: 14, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#0d9488,#14b8a6)', color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: F, boxShadow: '0 8px 28px rgba(20,184,166,.45)', display: 'flex', alignItems: 'center', gap: 8, transition: 'transform .18s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
              <ArrowLeft size={16} /> احجز موعدك الآن
            </button>
            <button onClick={() => scrollTo('services')} style={{ padding: '15px 36px', borderRadius: 14, cursor: 'pointer', background: 'rgba(255,255,255,.08)', border: '1.5px solid rgba(255,255,255,.2)', color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: F, transition: 'background .18s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.14)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.08)'}>
              خدماتنا
            </button>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 52 }}>
            {['معتمد ISO', 'علاج بلا ألم', 'مواعيد في نفس اليوم'].map(b => (
              <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', borderRadius: 99, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', color: 'rgba(255,255,255,.75)', fontSize: 12, fontWeight: 600, fontFamily: F }}>
                <CheckCircle size={13} color="#14b8a6" /> {b}
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.35)', fontSize: 11, fontFamily: F }}>
          <span>اسحب للأسفل</span>
          <div style={{ width: 1.5, height: 40, background: 'linear-gradient(to bottom,rgba(255,255,255,.3),transparent)' }} />
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ background: '#0d9488', padding: '52px 5%' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20 }} className="stats-grid">
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: F, fontSize: 42, fontWeight: 900, color: '#fff' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.75)', fontWeight: 600, marginTop: 4, fontFamily: F }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" style={{ padding: '90px 5%', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{ color: '#0d9488', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', fontFamily: F }}>ما نقدمه</span>
            <h2 style={{ fontFamily: F, fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, marginTop: 8 }}>خدمات أسنان شاملة</h2>
            <p style={{ color: '#64748b', fontSize: 16, marginTop: 12, maxWidth: 500, margin: '12px auto 0', fontFamily: F }}>من الوقاية إلى الكمال — كل خدمة تحتاجها تحت سقف واحد.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 24 }}>
            {SERVICES.map((s, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 20, padding: '28px 28px 24px', border: '1px solid #e2e8f0', cursor: 'default', transition: 'transform .2s, box-shadow .2s', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,.1)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,.05)' }}>
                <div style={{ width: 50, height: 50, borderRadius: 14, background: 'linear-gradient(135deg,#ccfbf1,#99f6e4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <s.icon size={24} color="#0d9488" />
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 10, fontFamily: F }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, fontFamily: F }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" style={{ padding: '90px 5%', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 48, alignItems: 'center' }}>
          <div>
            <span style={{ color: '#0d9488', fontSize: 13, fontWeight: 700, letterSpacing: '.1em', fontFamily: F }}>من نحن</span>
            <h2 style={{ fontFamily: F, fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 900, marginTop: 8, lineHeight: 1.2 }}>طب أسنان مدفوع بالرعاية والابتكار</h2>
            <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.8, marginTop: 16, fontFamily: F }}>
              في {CLINIC_NAME}، ندمج أحدث التقنيات مع رعاية حقيقية. فريقنا من المتخصصين ملتزم بتقديم نتائج استثنائية في بيئة مريحة وخالية من القلق.
            </p>
            <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.8, marginTop: 12, fontFamily: F }}>سواء كانت زيارتك الأولى أو كنت مريضاً قديماً، نعامل كل ابتسامة كأنها ابتسامتنا.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 28 }}>
              {['أشعة رقمية وتصوير ثلاثي الأبعاد متطور', 'طاقم متعدد اللغات — عربي وإنجليزي', 'خطط دفع مرنة وتأمين مقبول', 'مواعيد طوارئ متاحة 7 أيام في الأسبوع'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#334155', fontFamily: F }}>
                  <CheckCircle size={17} color="#0d9488" style={{ flexShrink: 0 }} /> {f}
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ borderRadius: 28, background: 'linear-gradient(135deg,#0f172a,#134e4a)', padding: 40, color: '#fff', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(20,184,166,.3) 0%,transparent 70%)' }} />
              <div style={{ fontFamily: F, fontSize: 22, fontWeight: 900, marginBottom: 6 }}>وعدنا لك</div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,.7)', lineHeight: 1.7, marginBottom: 28, fontFamily: F }}>كل مريض يستحق ابتسامة يفخر بها. نحن هنا لنجعل ذلك يحدث — بأمان وراحة وجمال.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[['معتمد ISO', Shield], ['فريق متخصص', Users], ['تقنية حديثة', Zap], ['رعاية 5 نجوم', Star]].map(([label, Icon]) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,.08)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Icon size={18} color="#2dd4bf" />
                    <span style={{ fontSize: 13, fontWeight: 700, fontFamily: F }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: -18, right: -18, background: '#fff', borderRadius: 16, padding: '14px 20px', boxShadow: '0 8px 32px rgba(0,0,0,.12)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Star size={20} fill="#0d9488" color="#0d9488" />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#1e293b', fontFamily: F }}>4.9 / 5</div>
                <div style={{ fontSize: 12, color: '#64748b', fontFamily: F }}>أكثر من 8000 تقييم</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" style={{ padding: '90px 5%', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span style={{ color: '#0d9488', fontSize: 13, fontWeight: 700, letterSpacing: '.1em', fontFamily: F }}>قصص مرضانا</span>
            <h2 style={{ fontFamily: F, fontSize: 'clamp(24px,4vw,38px)', fontWeight: 900, marginTop: 8 }}>ابتسامات حقيقية، نتائج حقيقية</h2>
          </div>
          {!reviewsLoading && reviews.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', fontSize: 15, fontFamily: F, padding: '20px 0' }}>
              لا توجد تقييمات متاحة حالياً
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24 }}>
              {reviews.slice(0, 6).map((t, i) => (
                <div key={t._id || i} style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
                  <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                    {Array.from({ length: t.rating || 0 }).map((_, j) => <Star key={j} size={15} fill="#f59e0b" color="#f59e0b" />)}
                  </div>
                  <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.75, marginBottom: 20, fontStyle: 'italic', fontFamily: F }}>"{t.comment}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#0d9488,#14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: F }}>
                      {(t.name || '؟')[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, fontFamily: F }}>{t.name}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <button
              onClick={() => setShowReviewModal(true)}
              style={{ padding: '13px 32px', borderRadius: 14, border: '1.5px solid #0d9488', cursor: 'pointer', background: '#fff', color: '#0d9488', fontSize: 14, fontWeight: 700, fontFamily: F, transition: 'background .18s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f0fdfa'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              شارك تجربتك
            </button>
          </div>
        </div>
      </section>

      {/* ── Review submission modal ── */}
      {showReviewModal && (
        <div
          onClick={e => e.target === e.currentTarget && setShowReviewModal(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(15,23,42,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div style={{ background: '#fff', borderRadius: 20, padding: 28, width: '100%', maxWidth: 440, fontFamily: F, direction: 'rtl' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1e293b' }}>شارك تجربتك</h3>
              <button onClick={() => setShowReviewModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>الاسم</label>
                <input
                  required
                  value={reviewForm.name}
                  onChange={e => setReviewForm(f => ({ ...f, name: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, fontFamily: F, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>التقييم</label>
                <StarPicker value={reviewForm.rating} onChange={n => setReviewForm(f => ({ ...f, rating: n }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 6 }}>التعليق</label>
                <textarea
                  required
                  rows={4}
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, fontFamily: F, resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                style={{ padding: '12px 0', borderRadius: 12, border: 'none', cursor: submitting ? 'default' : 'pointer', background: '#0d9488', color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: F, opacity: submitting ? .7 : 1 }}
              >
                {submitting ? 'جارٍ الإرسال...' : 'إرسال التقييم'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Contact / CTA ── */}
      <section id="contact" style={{ padding: '90px 5%', background: 'linear-gradient(135deg,#0f172a,#134e4a)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: F, fontSize: 'clamp(26px,4vw,46px)', fontWeight: 900, color: '#fff', marginBottom: 14 }}>
            هل أنت مستعد لابتسامة أجمل؟
          </h2>

          <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 16, marginBottom: 44, fontFamily: F }}>
            احجز موعدك اليوم وخذ أول خطوة نحو الابتسامة التي تستحقها.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
              gap: 20,
              marginBottom: 44,
            }}
          >
            {CONTACT_ITEMS.map(({ icon: Icon, label, value, link }) => (
              <div
                key={label}
                onClick={() => {
                  if (!link) return

                  if (
                    link.startsWith('tel:') ||
                    link.startsWith('mailto:')
                  ) {
                    window.location.href = link
                  } else {
                    window.open(link, '_blank')
                  }
                }}
                style={{
                  background: 'rgba(255,255,255,.07)',
                  borderRadius: 16,
                  padding: '20px 16px',
                  border: '1px solid rgba(255,255,255,.1)',
                  textAlign: 'center',
                  cursor: link ? 'pointer' : 'default',
                }}
              >
                <Icon size={22} color="#2dd4bf" style={{ margin: '0 auto 10px' }} />

                <div
                  style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,.5)',
                    marginBottom: 4,
                    fontFamily: F,
                  }}
                >
                  {label}
                </div>

                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#fff',
                    fontFamily: F,
                    textAlign: 'center',
                    direction: label === 'راسلنا' ? 'ltr' : 'rtl',
                    overflowWrap: 'anywhere',
                    width: '100%',
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => alert('سيتم إطلاق خاصية الحجز قريباً!')}
            style={{
              padding: '16px 44px',
              borderRadius: 14,
              border: 'none',
              cursor: 'pointer',
              background: 'linear-gradient(135deg,#0d9488,#14b8a6)',
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              fontFamily: F,
              boxShadow: '0 8px 28px rgba(20,184,166,.4)',
              transition: 'transform .18s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
          >
            احجز موعداً الآن ←
          </button>
        </div>
      </section >
      {/* ── Footer ── */}
      <footer  style={{ background: '#0a0f1a', padding: '28px 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }
      }>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg,#0d9488,#14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ToothIcon size={17} color="#fff" />
          </div>
          <span style={{ fontFamily: F, fontSize: 15, fontWeight: 800, color: '#fff' }}>{CLINIC_NAME}</span>
        </div>
        <p style={{ fontSize: 12, color: '#475569', fontFamily: F }}>© 2025 {CLINIC_NAME}. جميع الحقوق محفوظة.</p>
        <button onClick={onEnterLogin} style={{ background: 'none', border: '1px solid #1e293b', borderRadius: 8, padding: '7px 18px', color: '#64748b', fontSize: 12, cursor: 'pointer', fontWeight: 600, fontFamily: F }}>
          بوابة الموظفين
        </button>
      </footer >

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-hamburger { display: flex !important; }
        }
        @media (min-width: 640px) {
          .stats-grid { grid-template-columns: repeat(4,1fr) !important; }
        }
      `}</style>

      <a
        href="https://wa.me/201140212417"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
      >
        <FaWhatsapp size={32} />
      </a>
    </div >
  )
}
