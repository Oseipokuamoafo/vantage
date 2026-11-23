import { Suspense } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { logOut } from '../../data/auth';
import { useStudent } from '../../hooks/useStudent';
import { PrototypeBanner } from './PrototypeBanner';
import { buttonClass } from '../ui';

const NAV = [
  { to: '/profile', label: 'Profile' },
  { to: '/goal', label: 'Goal' },
  { to: '/constraints', label: 'Constraints' },
  { to: '/explore', label: 'Explore' },
  { to: '/compare', label: 'Compare' },
  { to: '/plan', label: 'Plan' },
  { to: '/saved', label: 'Saved' },
];

// The active item carries a yellow trail marker; hovering slides one in.
function navClass({ isActive }: { isActive: boolean }) {
  return `relative inline-flex min-h-[44px] items-center whitespace-nowrap px-3 text-sm font-semibold transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:rounded-full after:bg-marker after:transition-transform after:duration-200 ${
    isActive
      ? 'text-white after:scale-x-100'
      : 'text-white/70 after:scale-x-0 hover:text-white hover:after:scale-x-50'
  }`;
}

export function AppShell() {
  const { user } = useStudent();
  const navigate = useNavigate();
  const items = user?.role === 'admin' ? [...NAV, { to: '/admin', label: 'Admin' }] : NAV;

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-paper-raised focus:px-3 focus:py-2"
      >
        Skip to main content
      </a>
      <PrototypeBanner />
      <header className="topo bg-ink text-white">
        <div className="mx-auto flex max-w-content items-center justify-between gap-3 px-4 py-3">
          <Link
            to="/"
            className="group flex items-center gap-2.5 rounded-lg"
            aria-label="Vantage home"
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 32 32"
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:-translate-y-0.5"
            >
              <path d="M2 27 L12 11 L17 18 L21 13 L30 27 Z" fill="#f2c230" />
              <path d="M12 11 L14.6 15 L12 14.2 L9.6 15.2 Z" fill="#ffffff" />
              <circle cx="24" cy="7" r="2.6" fill="#ffffff" fillOpacity="0.85" />
            </svg>
            <span className="text-xl font-extrabold tracking-tight">Vantage</span>
          </Link>
          <div className="flex items-center gap-2 text-sm">
            {user ? (
              <>
                <span
                  className="hidden max-w-[16rem] truncate text-white/70 sm:inline"
                  title={user.email}
                >
                  {user.email}
                </span>
                <button
                  type="button"
                  className={buttonClass('inverse', 'sm')}
                  onClick={() => {
                    logOut();
                    navigate('/');
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={buttonClass('inverse', 'sm')}>
                  Log in
                </Link>
                <Link to="/signup" className={buttonClass('primary', 'sm')}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
        {user && (
          <nav aria-label="Main" className="mx-auto max-w-content px-2">
            <ul className="flex gap-1 overflow-x-auto px-1">
              {items.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} className={navClass}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>
      <main
        id="main"
        tabIndex={-1}
        className="mx-auto w-full max-w-content flex-1 px-4 py-6 outline-none sm:py-10"
      >
        <Suspense fallback={<p className="text-ink-muted">Loading…</p>}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="border-t border-line px-4 py-8 text-center text-sm text-ink-muted">
        Vantage shows trade-offs to support your own decision. It does not make the decision for
        you.
      </footer>
    </div>
  );
}
