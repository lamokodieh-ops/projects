import { NavLink, Outlet } from 'react-router-dom'
import { isDemo } from '../api'
import { useAuth } from '../AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo">
          Fort<span>is</span>
        </div>
        {isDemo && (
          <p className="demo-banner" title="Static gallery build — data is simulated in the browser">
            Demo mode · simulated data
          </p>
        )}
        <nav>
          <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            Overview
          </NavLink>
          <NavLink
            to="/investments"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            Investments
          </NavLink>
          <NavLink
            to="/transactions"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            Transactions
          </NavLink>
        </nav>
        <div className="user-meta">
          Signed in as
          <br />
          <strong style={{ color: 'var(--mist)' }}>{user?.name}</strong>
        </div>
        <button type="button" className="btn btn-ghost logout" onClick={logout}>
          Sign out
        </button>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}