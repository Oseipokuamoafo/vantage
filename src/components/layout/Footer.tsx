import { Link } from 'react-router-dom';
import { Logo } from './Logo';

const REPO = 'https://github.com/Oseipokuamoafo/vantage';

const COLUMNS: { title: string; links: { label: string; to?: string; href?: string }[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'Explore the catalog', to: '/explore' },
      { label: 'Compare options', to: '/compare' },
      { label: 'Plan by semester', to: '/plan' },
      { label: 'Saved plans', to: '/saved' },
    ],
  },
  {
    title: 'Resources',
    links: [
      {
        label: 'How the scoring works',
        href: `${REPO}/blob/main/docs/ARCHITECTURE.md#scoring-model-f5`,
      },
      { label: 'Design system', href: `${REPO}/blob/main/docs/DESIGN.md` },
      { label: 'Contributing', href: `${REPO}/blob/main/CONTRIBUTING.md` },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'About Vantage', href: `${REPO}#readme` },
      { label: 'Prototype limitations', href: `${REPO}#prototype-limitations` },
      { label: 'MIT license', href: `${REPO}/blob/main/LICENSE` },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative z-10 mt-8 rounded-t-[32px] border-t border-border bg-surface px-4 pb-12 pt-14 sm:px-6 sm:pb-14">
      <div className="mx-auto grid max-w-content gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-body">
            Decision support for students comparing career-building opportunities. You make the
            call.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-sm font-bold text-navy">{col.title}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {col.links.map((l) => (
                <li key={l.label}>
                  {l.to ? (
                    <Link
                      to={l.to}
                      className="text-body underline-offset-4 hover:text-primary hover:underline"
                    >
                      {l.label}
                    </Link>
                  ) : (
                    <a
                      href={l.href}
                      className="text-body underline-offset-4 hover:text-primary hover:underline"
                      rel="noreferrer"
                      target="_blank"
                    >
                      {l.label}
                      <span className="sr-only"> (opens GitHub in a new tab)</span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="mx-auto mt-12 max-w-content border-t border-border pt-6 text-sm text-muted">
        <p>
          <strong className="font-semibold text-navy">Prototype.</strong> Accounts are stored in
          your browser only. All opportunity, outcome and sample-story content is sample data, not
          real statistics. Vantage shows trade-offs to support your own decision; it does not make
          the decision for you.
        </p>
      </div>
    </footer>
  );
}
