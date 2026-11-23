import { useCurrentUser } from '../data/auth';
import { useGoalTypes } from '../data/content';
import { useProfile } from '../data/profiles';
import { useWorkspace } from '../data/workspace';

/** Everything the student-facing screens need about the signed-in student. */
export function useStudent() {
  const user = useCurrentUser();
  const profile = useProfile(user?.id);
  const goalTypes = useGoalTypes();
  const workspace = useWorkspace(user?.id);
  const goal = goalTypes.find((g) => g.id === profile?.goalTypeId);
  return { user, profile, goal, goalTypes, constraints: profile?.constraints, workspace };
}
