// Domain model for Vantage. See docs/ARCHITECTURE.md for the full description.

export type DataQuality = 'sourced' | 'limited' | 'team_estimate';

export const OPPORTUNITY_TYPES = [
  'certification',
  'side_project',
  'student_org',
  'internship',
  'research_reu',
] as const;
export type OpportunityType = (typeof OPPORTUNITY_TYPES)[number];

export type Season = 'spring' | 'summer' | 'fall';

export interface TimingWindow {
  label: string;
  season: Season;
  note: string;
}

export interface GoalRelevance {
  /** 0–10 signaling value of this opportunity for the goal type. */
  signaling: number;
  rationale: string;
}

export interface Opportunity {
  id: string;
  type: OpportunityType;
  title: string;
  description: string;
  timeCommitmentHoursPerWeek: number;
  durationWeeks: number;
  costUSD: number;
  skillsBuilt: string[];
  signalingNotes: string;
  timingWindows: TimingWindow[];
  goalRelevance: Record<string, GoalRelevance>;
  source: string;
  dataQuality: DataQuality;
}

export type AttributeKey = 'time' | 'skill' | 'signaling';
export type Weights = Record<AttributeKey, number>;

export type GoalStatus = 'active' | 'coming_soon';

export interface GoalType {
  id: string;
  name: string;
  description: string;
  examples: string[];
  status: GoalStatus;
  weights: Weights;
  targetSkills: string[];
  /** Number of matched target skills that earns a full skill score. */
  skillSaturation: number;
  /** Total hours at which the time-commitment score reaches 0. */
  timeHorizonHours: number;
  source: string;
  dataQuality: DataQuality;
}

export interface OutcomeRecord {
  id: string;
  goalTypeId: string;
  opportunityId: string;
  metric: string;
  /** Share of the cohort reporting the outcome, 0–1. */
  outcomeRate: number;
  sampleSize: number;
  cohort: string;
  source: string;
  dataQuality: DataQuality;
}

export interface Settings {
  minOutcomeSampleSize: number;
  demoMode: boolean;
}

export type HistoryAction = 'create' | 'update' | 'delete' | 'import' | 'reset';

export interface HistoryEntry {
  id: string;
  at: string;
  actorEmail: string;
  entity: 'opportunity' | 'goalType' | 'outcomes' | 'settings' | 'content';
  entityId: string;
  action: HistoryAction;
  summary: string;
}

export type Role = 'student' | 'admin';

export interface User {
  id: string;
  email: string;
  salt: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
}

export interface Session {
  userId: string;
}

export const YEARS = ['first_year', 'sophomore', 'junior', 'senior', 'graduate', 'other'] as const;
export type Year = (typeof YEARS)[number];

export type YesNoPrivate = 'yes' | 'no' | 'prefer_not';

export interface Constraints {
  weeklyHours: number;
  budgetUSD: number;
  semestersRemaining: number;
}

export interface Profile {
  userId: string;
  year: Year;
  major: string;
  institution: string;
  firstGen?: YesNoPrivate;
  transferStudent?: YesNoPrivate;
  workingWhileStudying?: YesNoPrivate;
  goalTypeId?: string;
  constraints?: Constraints;
  onboardingComplete: boolean;
  updatedAt: string;
}

/** termId → opportunity ids placed in that term. */
export type Timeline = Record<string, string[]>;

export interface Workspace {
  compareIds: string[];
  timeline: Timeline;
  /** Saved plan currently loaded into the workspace, if any. */
  activePlanId?: string;
}

export interface SavedPlan {
  id: string;
  ownerId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  goalTypeId: string;
  opportunityIds: string[];
  constraints: Constraints;
  timeline: Timeline;
}

export interface Persona {
  id: string;
  name: string;
  summary: string;
  story: string;
  email: string;
  profile: Omit<
    Profile,
    'userId' | 'updatedAt' | 'goalTypeId' | 'constraints' | 'onboardingComplete'
  >;
  goalTypeId: string;
  constraints: Constraints;
  compareIds: string[];
}
