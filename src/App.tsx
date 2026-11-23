import { lazy } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { RequireAdmin, RequireAuth } from './components/layout/guards';
import { LandingPage } from './features/shell';

// Route-level code splitting keeps the initial bundle small.
const SignUpPage = lazy(() => import('./features/profile/SignUpPage'));
const LoginPage = lazy(() => import('./features/profile/LoginPage'));
const ResetPasswordPage = lazy(() => import('./features/profile/ResetPasswordPage'));
const ProfilePage = lazy(() => import('./features/profile/ProfilePage'));
const GoalPage = lazy(() => import('./features/goal/GoalPage'));
const ConstraintsPage = lazy(() => import('./features/constraints/ConstraintsPage'));
const ExplorePage = lazy(() => import('./features/catalog/ExplorePage'));
const ComparePage = lazy(() => import('./features/compare/ComparePage'));
const PlanPage = lazy(() => import('./features/planner/PlanPage'));
const SavedPage = lazy(() => import('./features/saved/SavedPage'));
const AdminPage = lazy(() => import('./features/admin/AdminPage'));
const NotFoundPage = lazy(() => import('./features/shell/NotFoundPage'));

const authed = (el: JSX.Element) => <RequireAuth>{el}</RequireAuth>;

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<LandingPage />} />
          <Route path="signup" element={<SignUpPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="reset" element={<ResetPasswordPage />} />
          <Route path="profile" element={authed(<ProfilePage />)} />
          <Route path="goal" element={authed(<GoalPage />)} />
          <Route path="constraints" element={authed(<ConstraintsPage />)} />
          <Route path="explore" element={authed(<ExplorePage />)} />
          <Route path="compare" element={authed(<ComparePage />)} />
          <Route path="plan" element={authed(<PlanPage />)} />
          <Route path="saved" element={authed(<SavedPage />)} />
          <Route
            path="admin"
            element={
              <RequireAdmin>
                <AdminPage />
              </RequireAdmin>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
