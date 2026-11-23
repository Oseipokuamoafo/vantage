import type { ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'accent' | 'caution' | 'alert' | 'ink';

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-paper-sunk text-ink-soft border-line',
  accent: 'bg-accent-soft text-accent-strong border-accent/30',
  caution: 'bg-caution-soft text-caution border-caution/30',
  alert: 'bg-alert-soft text-alert border-alert/30',
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
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
