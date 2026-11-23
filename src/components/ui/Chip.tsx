import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { chipClass } from './styles';

export function CheckIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" className={className}>
      <path
        d="M3.5 8.5 6.5 11.5 12.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Toggleable outlined pill. Selected = blue fill, white text and a check icon. */
export function Chip({
  selected = false,
  children,
  className = '',
  ...rest
}: { selected?: boolean; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`${chipClass(selected)} ${className}`}
      {...rest}
    >
      {selected && <CheckIcon />}
      {children}
    </button>
  );
}

/** Non-interactive outlined pill (skills, tags). */
export function Tag({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`${chipClass(false, false)} min-h-[32px] px-3 text-[13px] ${className}`}>
      {children}
    </span>
  );
}
