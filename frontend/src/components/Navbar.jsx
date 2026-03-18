import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Luggage, Plus } from 'lucide-react'

export default function Navbar({ onNewTrip }) {
  const { pathname } = useLocation()

  return (
    <header className="sticky top-0 z-40" style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2 select-none">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ background: 'var(--accent)', color: '#0e0e11', fontFamily: 'Syne, sans-serif' }}>
              ₹
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 15 }}>
              Trip<span style={{ color: 'var(--accent)' }}>Spend</span>
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            <NavLink to="/" active={pathname === '/'} icon={<LayoutDashboard size={15} />}>Dashboard</NavLink>
            <NavLink to="/trips" active={pathname.startsWith('/trips')} icon={<Luggage size={15} />}>Trips</NavLink>
          </nav>

          <button onClick={onNewTrip} className="btn-primary flex items-center gap-1.5" style={{ padding: '7px 14px', fontSize: 13 }}>
            <Plus size={14} />
            <span className="hidden sm:inline">New Trip</span>
            <span className="sm:hidden">Trip</span>
          </button>
        </div>
      </div>

      <div className="sm:hidden flex" style={{ borderTop: '1px solid var(--border)' }}>
        <MobileNavLink to="/" active={pathname === '/'} icon={<LayoutDashboard size={16} />} label="Dashboard" />
        <MobileNavLink to="/trips" active={pathname.startsWith('/trips')} icon={<Luggage size={16} />} label="Trips" />
      </div>
    </header>
  )
}

function NavLink({ to, active, icon, children }) {
  return (
    <Link to={to}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
      style={{ color: active ? 'var(--text)' : 'var(--text-2)', background: active ? 'var(--bg-elevated)' : 'transparent' }}>
      {icon}{children}
    </Link>
  )
}

function MobileNavLink({ to, active, icon, label }) {
  return (
    <Link to={to}
      className="flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors"
      style={{ color: active ? 'var(--accent)' : 'var(--text-3)' }}>
      {icon}{label}
    </Link>
  )
}
