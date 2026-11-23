import type { ReactNode } from 'react';

type Tone = 'info' | 'caution' | 'alert' | 'success';

const tones: Record<Tone, string> = {
  info: 'border-line bg-paper-sunk text-ink',
  caution: 'border-caution/30 bg-caution-soft text-ink',
  alert: 'border-alert/30 bg-alert-soft text-ink',
  success: 'border-accent/30 bg-accent-soft text-ink',
};

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
      className={`rounded-lg border px-4 py-3 text-sm ${tones[tone]}`}
      role={live ? (tone === 'alert' ? 'alert' : 'status') : undefined}
    >
      {title && <p className="font-semibold">{title}</p>}
      <div className={title ? 'mt-1' : ''}>{children}</div>
    </div>
  );
}
