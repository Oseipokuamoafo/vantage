import type { ReactNode } from 'react';

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  /** Only for information the title doesn't carry, such as a step number. */
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl space-y-3">
        {eyebrow && (
          <p className="inline-flex rounded-full bg-tint px-3 py-1 text-sm font-semibold text-primary-active">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[2rem] font-extrabold tracking-[-0.025em] sm:text-[2.75rem]">
          {title}
        </h1>
        {description && (
          <div className="max-w-[65ch] text-base leading-relaxed text-body sm:text-lg">
            {description}
          </div>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </header>
  );
}
