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
    <div className="rounded-card border border-border bg-surface px-6 py-12 text-center shadow-soft">
      <span
        className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-tint text-primary"
        aria-hidden="true"
      >
        <svg width="26" height="26" viewBox="0 0 24 24">
          <path
            d="M4 18 9.5 9l4 5 2.5-3L20 18Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="16.5" cy="6.5" r="1.8" fill="currentColor" />
        </svg>
      </span>
      <p className="text-xl font-extrabold text-navy">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-md text-body">{children}</div>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
