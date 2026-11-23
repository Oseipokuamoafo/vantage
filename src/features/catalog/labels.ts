import type { OpportunityType } from '../../data/types';

export const TYPE_LABELS: Record<OpportunityType, string> = {
  certification: 'Certification',
  side_project: 'Side project',
  student_org: 'Student org',
  internship: 'Internship',
  research_reu: 'Research / REU',
};

export const formatCost = (usd: number) =>
  usd === 0 ? 'No cost' : `$${usd % 1 === 0 ? usd.toLocaleString('en-US') : usd.toFixed(2)}`;
