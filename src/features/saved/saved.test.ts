import { describe, expect, it } from 'vitest';
import { logIn, logOut, signUp } from '../../data/auth';
import { SEED } from '../../data/content';
import { createPlan, deletePlan, listPlans, renamePlan } from '../../data/plans';
import { getProfile, saveProfile, updateProfile } from '../../data/profiles';
import { diffPlan } from './diff';

const constraints = { weeklyHours: 8, budgetUSD: 100, semestersRemaining: 5 };

async function setup() {
  const user = await signUp('marcus@example.edu', 'password123');
  saveProfile({
    userId: user.id,
    year: 'sophomore',
    major: 'IT',
    institution: 'State U',
    goalTypeId: 'cloud-internship',
    constraints,
    onboardingComplete: true,
    updatedAt: new Date().toISOString(),
  });
  const plan = createPlan(user.id, {
    name: 'Cloud plan',
    goalTypeId: 'cloud-internship',
    opportunityIds: ['aws-saa', 'project-serverless-resume', 'org-cloud-club'],
    constraints,
    timeline: { 'spring-2027': ['aws-saa'] },
  });
  return { user, plan };
}

describe('saved plans', () => {
  it('survive logout/login and profile edits', async () => {
    const { user, plan } = await setup();
    logOut();
    const again = await logIn('marcus@example.edu', 'password123');
    expect(again.id).toBe(user.id);
    updateProfile(user.id, {
      major: 'Computer Science',
      constraints: { ...constraints, weeklyHours: 12 },
    });
    expect(getProfile(user.id)?.major).toBe('Computer Science');
    const plans = listPlans(user.id);
    expect(plans).toHaveLength(1);
    expect(plans[0]).toEqual(plan);
  });

  it('renames and deletes', async () => {
    const { user, plan } = await setup();
    renamePlan(user.id, plan.id, 'Renamed');
    expect(listPlans(user.id)[0]!.name).toBe('Renamed');
    deletePlan(user.id, plan.id);
    expect(listPlans(user.id)).toEqual([]);
  });

  it('describes what changed since saving', async () => {
    const { plan } = await setup();
    const none = diffPlan(
      plan,
      {
        goalTypeId: 'cloud-internship',
        constraints,
        opportunityIds: plan.opportunityIds,
        timeline: plan.timeline,
      },
      SEED.goalTypes,
    );
    expect(none).toEqual([]);
    const changes = diffPlan(
      plan,
      {
        goalTypeId: 'cs-phd',
        constraints: { ...constraints, weeklyHours: 12 },
        opportunityIds: ['aws-saa', 'kcna'],
        timeline: {},
      },
      SEED.goalTypes,
    );
    expect(changes.map((c) => c.field)).toEqual([
      'Goal',
      'Weekly hours',
      'Compared opportunities',
      'Semester plan',
    ]);
    expect(changes[0]).toEqual({
      field: 'Goal',
      before: 'Cloud engineering internship',
      after: 'Top-5 CS PhD',
    });
    expect(changes[1]).toEqual({
      field: 'Weekly hours',
      before: '8 hrs/week',
      after: '12 hrs/week',
    });
  });
});
