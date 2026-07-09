import { useState } from 'react'
import Sidebar from './Sidebar'
import { Menu, Bell, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function Layout({ children, activePage, onNavigate, title }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { dark, toggle } = useTheme()

  return (
    <div className="layout">
      <Sidebar
        activePage={activePage}
        onNavigate={onNavigate}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <div className="main-content">
        <header className="topbar">
          {/* Title on the right (RTL) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              className="mobile-menu-btn icon-btn"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={18} />
            </button>
            <h1 className="topbar-title">{title}</h1>
          </div>

          {/* Icons on the left (RTL) */}
          <div className="topbar-right">
            <button
              className="icon-btn"
              onClick={toggle}
              title={dark ? 'وضع نهاري' : 'وضع ليلي'}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="icon-btn">
              <Bell size={16} />
            </button>
          </div>
        </header>

        <main className="page-body">
          {children}
        </main>
      </div>
    </div>
  )
}
