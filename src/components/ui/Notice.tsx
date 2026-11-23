import type { ReactNode } from 'react';

type Tone = 'info' | 'caution' | 'alert' | 'success';

const tones: Record<Tone, string> = {
  info: 'border-border bg-surface',
  caution: 'border-amber-line/60 bg-amber-soft',
  alert: 'border-danger/40 bg-danger-soft',
  success: 'border-primary/25 bg-tint',
};

function Icon({ tone }: { tone: Tone }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: '0 0 20 20',
    'aria-hidden': true as const,
    className: 'mt-0.5 shrink-0',
  };
  if (tone === 'alert')
    return (
      <svg {...common} className={`${common.className} text-danger`}>
        <circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M10 5.5v5.5M10 13.6v.4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  if (tone === 'success')
    return (
      <svg {...common} className={`${common.className} text-primary`}>
        <circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M6.3 10.3 8.8 12.8 13.8 7.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  return (
    <svg
      {...common}
      className={`${common.className} ${tone === 'caution' ? 'text-amber' : 'text-primary'}`}
    >
      <circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10 9v5M10 6v.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Notice({
  tone = 'info',
  title,
  children,
  live,
}: {
  tone?: Tone;
  title?: string;
  children: ReactNode;
  /** Announce to screen readers when shown (use for form errors and confirmations). */
  live?: boolean;
}) {
  return (
    <div
      className={`flex gap-3 rounded-2xl border px-4 py-3.5 text-sm text-body ${tones[tone]}`}
      role={live ? (tone === 'alert' ? 'alert' : 'status') : undefined}
    >
      <Icon tone={tone} />
      <div className="min-w-0 flex-1">
        {title && <p className="font-bold text-navy">{title}</p>}
        <div className={title ? 'mt-1' : ''}>{children}</div>
      </div>
    </div>
  );
}
