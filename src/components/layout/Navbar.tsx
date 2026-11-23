import { useEffect, useId, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { logOut } from '../../data/auth';
import { useStudent } from '../../hooks/useStudent';
import { buttonClass } from '../ui';
import { openHelp } from './helpEvents';
import { Logo } from './Logo';

const NAV = [
  { to: '/profile', label: 'Profile' },
  { to: '/goal', label: 'Goal' },
  { to: '/constraints', label: 'Constraints' },
  { to: '/explore', label: 'Explore' },
  { to: '/compare', label: 'Compare' },
  { to: '/plan', label: 'Plan' },
  { to: '/saved', label: 'Saved' },
];

const desktopLink = ({ isActive }: { isActive: boolean }) =>
  `inline-flex min-h-[40px] items-center rounded-full px-3.5 text-[15px] font-semibold transition-colors duration-brand ${
    isActive ? 'bg-tint text-primary-active' : 'text-navy hover:bg-page hover:text-primary'
  }`;

const sheetLink = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-[48px] items-center rounded-2xl px-4 text-base font-semibold ${
    isActive ? 'bg-tint text-primary-active' : 'text-navy hover:bg-page'
  }`;

function HelpIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="8.3" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M7.7 7.7a2.4 2.4 0 1 1 3.2 2.3c-.6.2-.9.7-.9 1.3v.4M10 14.2v.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Navbar() {
  const { user } = useStudent();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const sheetId = useId();
  const menuButton = useRef<HTMLButtonElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const items = user?.role === 'admin' ? [...NAV, { to: '/admin', label: 'Admin' }] : NAV;

  // Close the sheet on navigation.
  useEffect(() => setOpen(false), [pathname]);

  // While the sheet is open: focus moves into it, Escape closes it, and Tab stays inside it.
  useEffect(() => {
    if (!open) return;
    sheet.current?.querySelector<HTMLElement>('a, button')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        menuButton.current?.focus();
        return;
      }
      if (e.key !== 'Tab' || !sheet.current) return;
      const focusables = [...sheet.current.querySelectorAll<HTMLElement>('a, button')];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  function close(returnFocus = true) {
    setOpen(false);
    if (returnFocus) menuButton.current?.focus();
  }

  const doLogOut = () => {
    logOut();
    setOpen(false);
    navigate('/');
  };

  const authButtons = (inSheet: boolean) =>
    user ? (
      <>
        <span
          className={`truncate text-sm text-muted ${inSheet ? 'px-1' : 'hidden max-w-[12rem] xl:inline'}`}
          title={user.email}
        >
          {user.email}
        </span>
        <button
          type="button"
          className={`${buttonClass('secondary', 'sm')} ${inSheet ? 'w-full' : ''}`}
          onClick={doLogOut}
        >
          Log out
        </button>
      </>
    ) : (
      <>
        <Link
          to="/login"
          className={`${buttonClass('secondary', 'sm')} ${inSheet ? 'w-full' : ''}`}
        >
          Log in
        </Link>
        <Link to="/signup" className={`${buttonClass('primary', 'sm')} ${inSheet ? 'w-full' : ''}`}>
          Get started
        </Link>
      </>
    );

  return (
    <div className="sticky top-3 z-40 px-3 pt-3 sm:top-6 sm:px-6 sm:pt-6">
      <div className="relative mx-auto max-w-content">
        <div className="flex min-h-[64px] items-center gap-3 rounded-nav border border-border bg-surface/95 px-4 shadow-soft backdrop-blur sm:px-5">
          <Link to="/" className="rounded-xl" aria-label="Vantage home">
            <Logo />
          </Link>
          {user && (
            <nav aria-label="Main" className="ml-4 hidden lg:block">
              <ul className="flex items-center gap-0.5">
                {items.map((item) => (
                  <li key={item.to}>
                    <NavLink to={item.to} className={desktopLink}>
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <div className="ml-auto hidden items-center gap-2 lg:flex">
            <button
              type="button"
              onClick={openHelp}
              className="flex h-10 w-10 items-center justify-center rounded-full text-navy transition-colors hover:bg-tint hover:text-primary"
              aria-label="Help: how Vantage works"
            >
              <HelpIcon />
            </button>
            {authButtons(false)}
          </div>
          <button
            ref={menuButton}
            type="button"
            className="ml-auto flex h-11 w-11 items-center justify-center rounded-full border-[1.5px] border-border text-navy transition-colors hover:border-primary hover:text-primary lg:hidden"
            aria-expanded={open}
            aria-controls={sheetId}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
              {open ? (
                <path
                  d="M5 5l10 10M15 5 5 15"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M3.5 6h13M3.5 10h13M3.5 14h13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>

        {open && (
          <>
            <button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              className="fixed inset-0 z-[-1] cursor-default bg-navy/10 lg:hidden"
              onClick={() => close(false)}
            />
            <div
              id={sheetId}
              ref={sheet}
              className="absolute inset-x-0 top-full mt-2 rounded-card border border-border bg-surface p-3 shadow-hover lg:hidden"
            >
              {user && (
                <nav aria-label="Main">
                  <ul className="grid gap-1">
                    {items.map((item) => (
                      <li key={item.to}>
                        <NavLink to={item.to} className={sheetLink}>
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
              <div className={`grid gap-2 p-1 ${user ? 'mt-2 border-t border-border pt-3' : ''}`}>
                <button
                  type="button"
                  onClick={() => {
                    close(false);
                    openHelp();
                  }}
                  className={`${buttonClass('ghost', 'sm')} justify-start`}
                >
                  How Vantage works
                </button>
                {authButtons(true)}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
