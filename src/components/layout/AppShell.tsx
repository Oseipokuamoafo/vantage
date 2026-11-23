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

function navClass({ isActive }: { isActive: boolean }) {
  return `inline-flex min-h-[44px] items-center whitespace-nowrap rounded-lg px-3 text-sm font-medium ${
    isActive
      ? 'bg-accent-soft text-accent-strong'
      : 'text-ink-soft hover:bg-paper-sunk hover:text-ink'
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
      <header className="border-b border-line bg-paper-raised">
        <div className="mx-auto flex max-w-content items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 rounded-lg" aria-label="Vantage home">
            <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
              <rect width="32" height="32" rx="7" fill="#16202e" />
              <path
                d="M8 9l8 15 8-15"
                fill="none"
                stroke="#7fd1c7"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-display text-xl font-semibold tracking-tight">Vantage</span>
          </Link>
          <div className="flex items-center gap-2 text-sm">
            {user ? (
              <>
                <span
                  className="hidden max-w-[16rem] truncate text-ink-muted sm:inline"
                  title={user.email}
                >
                  {user.email}
                </span>
                <button
                  type="button"
                  className={buttonClass('secondary', 'sm')}
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
                <Link to="/login" className={buttonClass('ghost', 'sm')}>
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
          <nav aria-label="Main" className="mx-auto max-w-content px-2 pb-2">
            <ul className="flex gap-1 overflow-x-auto px-2">
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
      <footer className="border-t border-line px-4 py-6 text-center text-xs text-ink-muted">
        Vantage shows trade-offs to support your own decision. It does not make the decision for
        you.
      </footer>
    </div>
  );
}
