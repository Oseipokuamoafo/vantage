import type { ReactNode } from 'react';
import { Card } from '../../components/ui';

export function AuthCard({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md">
      <Card className="space-y-5">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold">{title}</h1>
          {intro && <div className="text-sm text-ink-soft">{intro}</div>}
        </div>
        {children}
      </Card>
    </div>
  );
}
