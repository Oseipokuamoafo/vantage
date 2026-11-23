import type { ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'accent' | 'caution' | 'alert' | 'ink';

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-paper-sunk text-ink-soft border-line',
  accent: 'bg-accent-soft text-accent-strong border-accent/25',
  caution: 'bg-caution-soft text-caution border-caution/25',
  alert: 'bg-alert-soft text-alert border-alert/25',
  ink: 'bg-ink text-paper border-ink',
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
      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs font-semibold leading-tight ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
