import type { DataQuality } from '../../data/types';
import type { BadgeTone } from '../../components/ui';

export const DATA_QUALITY: Record<
  DataQuality,
  { label: string; description: string; tone: BadgeTone }
> = {
  sourced: {
    label: 'Sourced',
    description: 'Based on a cited, verifiable source.',
    tone: 'accent',
  },
  limited: {
    label: 'Limited data',
    description: 'Based on partial or provider-listed information. Verify before relying on it.',
    tone: 'caution',
  },
  team_estimate: {
    label: 'Team estimate',
    description: 'An estimate by the Vantage team, not yet backed by a source.',
    tone: 'neutral',
  },
};
