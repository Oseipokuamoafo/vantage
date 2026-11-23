import type { OpportunityType } from '../../data/types';
import { shapePath, TYPE_COLORS } from './typeShapes';

export function TypeMark({ type, size = 14 }: { type: OpportunityType; size?: number }) {
  const r = size * 0.32;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`}
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d={shapePath(type, r)}
        fill={TYPE_COLORS[type]}
        stroke="#0f2a26"
        strokeWidth={1.1}
        strokeLinejoin="round"
      />
    </svg>
  );
}
