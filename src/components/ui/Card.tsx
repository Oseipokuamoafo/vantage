import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'article' | 'li';
}

export function Card({ as: Tag = 'div', className = '', ...rest }: CardProps) {
  return (
    <Tag
      className={`spotlight rounded-2xl border border-line bg-paper-raised p-4 sm:p-5 ${className}`}
      {...rest}
    />
  );
}
