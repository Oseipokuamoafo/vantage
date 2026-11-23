import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'article' | 'li';
}

export function Card({ as: Tag = 'div', className = '', ...rest }: CardProps) {
  return (
    <Tag
      className={`rounded-xl border border-line bg-paper-raised p-4 shadow-[0_1px_0_rgba(22,32,46,0.04)] sm:p-5 ${className}`}
      {...rest}
    />
  );
}
