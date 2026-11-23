import type { DataQuality } from '../../data/types';

export const DATA_QUALITY: Record<DataQuality, { label: string; description: string }> = {
  sourced: { label: 'Sourced', description: 'Based on a cited, verifiable source.' },
  limited: {
    label: 'Limited data',
    description: 'Based on partial or provider-listed information. Verify before relying on it.',
  },
  team_estimate: {
    label: 'Team estimate',
    description: 'An estimate by the Vantage team, not yet backed by a source.',
  },
};
