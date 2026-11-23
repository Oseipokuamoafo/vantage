import { ScoreMeter } from '../../components/ui';
import type { DataQuality } from '../../data/types';
import { ATTRIBUTE_SCALE_NOTES, type AttributeScore } from '../scoring';
import { DataQualityBadge } from './DataQualityBadge';

/**
 * The only way a rating is rendered in Vantage. The explanation and the data-quality
 * label are required props, so a rating can't appear without them.
 */
export function ScoreWithExplanation({
  attribute,
  quality,
  showLabel = true,
}: {
  attribute: AttributeScore;
  quality: DataQuality;
  showLabel?: boolean;
}) {
  return (
    <div className="space-y-1.5" data-testid={`score-${attribute.key}`}>
      {showLabel && <p className="text-sm font-semibold text-ink">{attribute.label}</p>}
      <ScoreMeter value={attribute.score} label={attribute.label} />
      <p className="text-sm leading-snug text-ink-soft">
        <span className="font-medium text-ink">Driven by:</span> {attribute.summary}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <DataQualityBadge quality={quality} />
        <span className="text-xs text-ink-muted">Weight {Math.round(attribute.weight * 100)}%</span>
      </div>
      <details className="disclosure text-sm">
        <summary className="font-semibold text-accent-strong underline-offset-4 hover:underline">
          Why this rating<span className="sr-only"> for {attribute.label}</span>
        </summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-ink-soft">
          {attribute.drivers.map((d) => (
            <li key={d}>{d}</li>
          ))}
          <li>{ATTRIBUTE_SCALE_NOTES[attribute.key]}</li>
          <li>
            Contributes {attribute.contribution.toFixed(1)} to the weighted summary (
            {attribute.score.toFixed(1)} × {Math.round(attribute.weight * 100)}%).
          </li>
        </ul>
      </details>
    </div>
  );
}
