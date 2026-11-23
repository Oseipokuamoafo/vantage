import type { ReactNode } from 'react';

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-line-strong px-5 py-10 text-center">
      <svg
        className="mx-auto mb-3 text-line-strong"
        width="56"
        height="28"
        viewBox="0 0 56 28"
        aria-hidden="true"
      >
        <path
          d="M2 24c8-12 14-12 20-4s12 8 18-6 12-10 14-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <p className="text-xl font-bold text-ink">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-md text-sm text-ink-soft">{children}</div>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
