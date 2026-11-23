import type { ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'accent' | 'caution' | 'alert' | 'ink';

const tones: Record<BadgeTone, string> = {
  neutral: 'border-border bg-surface text-body',
  accent: 'border-primary/40 bg-tint text-primary-active',
  caution: 'border-amber-line bg-amber-soft text-amber',
  alert: 'border-danger/50 bg-danger-soft text-danger',
  ink: 'border-navy bg-navy text-white',
};

export function Badge({
  tone = 'neutral',
  children,
  className = '',
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-5 ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
