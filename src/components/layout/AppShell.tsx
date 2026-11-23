import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Footer } from './Footer';
import { HelpBubble } from './HelpBubble';
import { Navbar } from './Navbar';
import { PrototypeBanner } from './PrototypeBanner';
import { TopoBackground } from './TopoBackground';

export function AppShell() {
  const { pathname } = useLocation();
  const isLanding = pathname === '/';

  return (
    <div className="relative flex min-h-screen flex-col">
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-full focus:bg-surface focus:px-4 focus:py-2 focus:font-semibold focus:text-primary focus:shadow-hover"
      >
        Skip to main content
      </a>
      {isLanding && <TopoBackground />}
      <PrototypeBanner />
      <Navbar />
      <main
        id="main"
        tabIndex={-1}
        className="relative z-10 mx-auto w-full max-w-content flex-1 px-4 pb-24 pt-10 outline-none sm:px-6 sm:pt-14"
      >
        <Suspense fallback={<p className="text-muted">Loading…</p>}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <HelpBubble />
    </div>
  );
}
