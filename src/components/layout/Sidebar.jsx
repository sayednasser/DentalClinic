import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { normalizeRole } from '../../utils/roles'
import {
  LayoutDashboard, Users, UserPlus, Stethoscope,
  CreditCard, Bell, LogOut, ChevronLeft,
  User, Settings, CalendarDays, Wallet, Star, Hourglass
} from 'lucide-react'

function ToothSVG({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M32 5 C22 5 13 11 12 21 C11 29 13 35 15 40 C17 45 17 51 19 57 C20 61 23 63 26 60 C28 57 29 50 31 46 C32 43 32 43 33 46 C35 50 36 57 38 60 C41 63 44 61 45 57 C47 51 47 45 49 40 C51 35 53 29 52 21 C51 11 42 5 32 5Z"
        fill="#ffffff" opacity="0.95"
      />
      <path
        d="M32 16 C30 22 30 30 32 37 C34 30 34 22 32 16Z"
        fill="#ffffff" opacity="0.30"
      />
    </svg>
  )
}

// Arabic UI labels - English identifiers
const ROLE_LABELS = {
  admin:        'مدير',
  doctor:       'طبيب',
  receptionist: 'موظف استقبال',
}

const ROLE_COLORS = {
  admin:        '#f59e0b',
  doctor:       '#14b8a6',
  receptionist: '#8b5cf6',
}

const NAV_CONFIG = {
  admin: [
    {
      section: 'نظرة عامة',
      items: [
        { id: 'dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
      ],
    },
    {
      section: 'الإدارة',
      items: [
        { id: 'patients', icon: Users,       label: 'المرضى'             },
        { id: 'doctors',  icon: Stethoscope, label: 'الأطباء'            },
        { id: 'staff',    icon: UserPlus,    label: 'موظفو الاستقبال'   },
      ],
    },
    {
      section: 'المواعيد',
      items: [
        { id: 'appointments', icon: CalendarDays, label: 'إدارة المواعيد' },
      ],
    },
    {
      section: 'المالية',
      items: [
        { id: 'payments', icon: CreditCard, label: 'المدفوعات'     },
        { id: 'debt',     icon: Bell,       label: 'تنبيهات الديون' },
        { id: 'expenses', icon: Wallet,     label: 'المصروفات'      },
      ],
    },
    {
      section: 'التقييمات',
      items: [
        { id: 'reviews', icon: Star, label: 'التقييمات' },
      ],
    },
    {
      section: 'الحساب',
      items: [
        { id: 'profile', icon: Settings, label: 'ملفي الشخصي' },
      ],
    },
  ],
  doctor: [
    {
      section: 'نظرة عامة',
      items: [
        { id: 'dashboard',    icon: LayoutDashboard, label: 'لوحة التحكم' },
        { id: 'patients',     icon: Users,           label: 'مرضاي'       },
        { id: 'appointments', icon: CalendarDays,    label: 'المواعيد'    },
      ],
    },
    {
      section: 'الحساب',
      items: [
        { id: 'profile', icon: User, label: 'ملفي الشخصي' },
      ],
    },
  ],
  receptionist: [
    {
      section: 'نظرة عامة',
      items: [
        { id: 'dashboard',      icon: LayoutDashboard, label: 'لوحة التحكم'    },
        { id: 'patients',       icon: Users,           label: 'المرضى'         },
        { id: 'appointments',   icon: CalendarDays,    label: 'المواعيد'       },
        { id: 'waiting-queue',  icon: Hourglass,       label: 'قائمة الانتظار' },
      ],
    },
    {
      section: 'إجراءات',
      items: [
        { id: 'new-patient', icon: UserPlus,   label: 'مريض جديد'  },
        { id: 'payments',    icon: CreditCard, label: 'المدفوعات'   },
        { id: 'expenses',    icon: Wallet,     label: 'المصروفات'   },
      ],
    },
    {
      section: 'الحساب',
      items: [
        { id: 'profile', icon: Settings, label: 'ملفي الشخصي' },
      ],
    },
  ],
}

export default function Sidebar({ activePage, onNavigate, mobileOpen, onClose }) {
  const { user, logout } = useAuth()
  const { toast }        = useToast()

  const role      = normalizeRole(user?.role)
  const navConfig = NAV_CONFIG[role] || NAV_CONFIG.receptionist
  const roleColor = ROLE_COLORS[role] || '#14b8a6'
  const roleLabel = ROLE_LABELS[role] || role
  const initials  = (user?.name || user?.email || '؟')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  async function handleLogout() {
    await logout()
    toast('تم تسجيل الخروج بنجاح', 'success')
  }

  return (
    <>
      <div
        className={`sidebar-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo__icon">
            <ToothSVG size={22} />
          </div>
          <div className="sidebar-logo__text">
            <div className="logo-text">دنتافلو</div>
            <div className="logo-sub">نظام إدارة العيادة</div>
          </div>
        </div>

        {/* Role badge */}
        <div style={{ padding: '10px 20px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 99,
            background: `${roleColor}22`, color: roleColor,
            fontSize: 11, fontWeight: 700,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: roleColor }} />
            {roleLabel}
          </span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navConfig.map(group => (
            <div key={group.section} className="nav-section">
              <div className="nav-section-label">{group.section}</div>
              {group.items.map(item => (
                <button
                  key={item.id}
                  className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                  onClick={() => { onNavigate(item.id); onClose() }}
                >
                  <item.icon className="nav-icon" />
                  <span>{item.label}</span>
                  {activePage === item.id && (
                    <ChevronLeft size={14} style={{ marginLeft: 'auto', opacity: .6 }} />
                  )}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* User card + logout */}
        <div className="sidebar-bottom">
          <div className="user-card">
            <div className="avatar">
              {user?.profilePicture
                ? <img src={user.profilePicture} alt="" />
                : initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || user?.email?.split('@')[0] || 'مستخدم'}
              </div>
              <div className="user-role">{roleLabel}</div>
            </div>
          </div>
          <button className="nav-item" onClick={handleLogout} style={{ marginTop: 4 }}>
            <LogOut className="nav-icon" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  )
}
