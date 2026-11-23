import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SEED } from '../../data/content';
import { scoreOpportunity } from '../scoring';
import { ScoreWithExplanation } from './ScoreWithExplanation';
import { FitPanel, SummaryWithExplanation } from './SummaryWithExplanation';

const goal = SEED.goalTypes[0]!;
const opp = SEED.opportunities.find((o) => o.id === 'aws-saa')!;

describe('transparency panel', () => {
  it('shows the driver and a data-quality label next to every attribute score', () => {
    const r = scoreOpportunity(opp, goal);
    render(<ScoreWithExplanation attribute={r.attributes.skill} quality={r.dataQuality} />);
    expect(screen.getByText('Driven by:')).toBeInTheDocument();
    expect(screen.getByText('Limited data')).toBeInTheDocument();
    expect(screen.getByText(/Skill development: 10.0 out of 10/)).toBeInTheDocument();
    expect(screen.getByText(/Why this rating/)).toBeInTheDocument();
  });

  it('shows the weighted summary with its primary driver and fit separately', () => {
    const r = scoreOpportunity(opp, goal, {
      weeklyHours: 8,
      budgetUSD: 100,
      semestersRemaining: 5,
    });
    render(
      <>
        <SummaryWithExplanation result={r} goalName={goal.name} />
        <FitPanel result={r} />
      </>,
    );
    expect(screen.getByText('Skill development')).toBeInTheDocument();
    expect(screen.getByText(/Constraint fit \(separate from the rating\)/)).toBeInTheDocument();
    expect(screen.getByText('Exceeds')).toBeInTheDocument();
  });
});
