import { NavLink, Outlet } from 'react-router-dom';
import { BRAND } from '../../brand.js';
import { isDemo } from '../../demoData.js';

const links = [
  { to: '/dashboard', label: 'Today' },
  { to: '/focus', label: 'Focus' },
  { to: '/insights', label: 'Stats' },
  { to: '/quiz', label: 'Quiz' },
  { to: '/settings', label: 'Settings' },
];

export function AppShell() {
  return (
    <div className="shell">
      <header className="shell__nav" role="banner">
        <NavLink className="shell__brand" to="/dashboard" end>
          {BRAND.name}
        </NavLink>
        <nav className="shell__links" aria-label="Main">
          {isDemo ? (
            <span className="badge badge--accent" style={{ alignSelf: 'center' }}>
              Demo
            </span>
          ) : null}
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => `shell__link${isActive ? ' shell__link--active' : ''}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main id="main-content">
        <Outlet />
      </main>
    </div>
  );
}
