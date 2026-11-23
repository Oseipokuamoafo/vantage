import type { OpportunityType } from '../../data/types';

/** Each type has its own color *and* shape, so identity never depends on color alone. */
export const TYPE_COLORS: Record<OpportunityType, string> = {
  certification: '#2a78d6',
  side_project: '#eb6834',
  student_org: '#1baf7a',
  internship: '#eda100',
  research_reu: '#e87ba4',
};

/** SVG path for a shape centered at (0,0) with radius r. */
export function shapePath(type: OpportunityType, r: number): string {
  switch (type) {
    case 'certification':
      return `M ${-r} 0 A ${r} ${r} 0 1 0 ${r} 0 A ${r} ${r} 0 1 0 ${-r} 0 Z`;
    case 'side_project': {
      const s = r * 0.88;
      return `M ${-s} ${-s} H ${s} V ${s} H ${-s} Z`;
    }
    case 'student_org': {
      const s = r * 1.2;
      return `M 0 ${-s} L ${s} 0 L 0 ${s} L ${-s} 0 Z`;
    }
    case 'internship': {
      const s = r * 1.25;
      return `M 0 ${-s} L ${s * 0.95} ${s * 0.7} L ${-s * 0.95} ${s * 0.7} Z`;
    }
    case 'research_reu': {
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i;
        return `${(r * 1.08 * Math.cos(a)).toFixed(2)} ${(r * 1.08 * Math.sin(a)).toFixed(2)}`;
      });
      return `M ${pts.join(' L ')} Z`;
    }
  }
}
