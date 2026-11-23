import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'article' | 'li';
  /** `tint` = pale-blue highlight surface. */
  tone?: 'white' | 'tint';
  /** Adds a slightly stronger shadow on hover (for clickable or focusable cards). */
  interactive?: boolean;
}

export function Card({
  as: Tag = 'div',
  tone = 'white',
  interactive = false,
  className = '',
  ...rest
}: CardProps) {
  const surface = tone === 'tint' ? 'bg-tint border-primary/15' : 'bg-surface border-border';
  return (
    <Tag
      className={`rounded-card border p-5 shadow-soft sm:p-7 ${surface} ${
        interactive ? 'transition-shadow duration-brand ease-brand hover:shadow-hover' : ''
      } ${className}`}
      {...rest}
    />
  );
}
