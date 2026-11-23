import personasJson from '../../data/seed/personas.json';
import { findUserByEmail, logIn, PERSONA_PASSWORD, resetPassword, signUp } from '../../data/auth';
import { saveProfile } from '../../data/profiles';
import { updateWorkspace } from '../../data/workspace';
import type { Persona } from '../../data/types';

export const PERSONAS = personasJson as unknown as Persona[];

/** Signs in as a demo persona and prefills profile, goal, constraints and comparison. */
export async function startPersona(persona: Persona): Promise<string> {
  let userId: string;
  const existing = findUserByEmail(persona.email);
  if (existing) {
    try {
      userId = (await logIn(persona.email, PERSONA_PASSWORD)).id;
    } catch {
      await resetPassword(persona.email, PERSONA_PASSWORD);
      userId = (await logIn(persona.email, PERSONA_PASSWORD)).id;
    }
  } else {
    userId = (await signUp(persona.email, PERSONA_PASSWORD)).id;
  }
  saveProfile({
    ...persona.profile,
    userId,
    goalTypeId: persona.goalTypeId,
    constraints: persona.constraints,
    onboardingComplete: true,
    updatedAt: new Date().toISOString(),
  });
  updateWorkspace(userId, (ws) => ({
    ...ws,
    compareIds: persona.compareIds,
    activePlanId: undefined,
  }));
  return userId;
}
