import type { ReactNode } from 'react';

type Tone = 'info' | 'caution' | 'alert' | 'success';

const tones: Record<Tone, string> = {
  info: 'border-line bg-paper-raised',
  caution: 'border-caution/30 bg-caution-soft',
  alert: 'border-alert/30 bg-alert-soft',
  success: 'border-accent/25 bg-accent-soft',
};

const bars: Record<Tone, string> = {
  info: 'bg-line-strong',
  caution: 'bg-marker',
  alert: 'bg-alert',
  success: 'bg-accent',
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
      className={`relative overflow-hidden rounded-xl border py-3 pl-5 pr-4 text-sm text-ink ${tones[tone]}`}
      role={live ? (tone === 'alert' ? 'alert' : 'status') : undefined}
    >
      <span className={`absolute inset-y-0 left-0 w-1.5 ${bars[tone]}`} aria-hidden="true" />
      {title && <p className="font-bold">{title}</p>}
      <div className={title ? 'mt-1' : ''}>{children}</div>
    </div>
  );
}
