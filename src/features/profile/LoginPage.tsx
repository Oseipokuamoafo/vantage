import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Notice, TextField } from '../../components/ui';
import { DEMO_ADMIN, logIn } from '../../data/auth';
import { getProfile } from '../../data/profiles';
import { AuthCard } from './AuthCard';
import { validateEmail } from './validation';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const err = validateEmail(email);
    setEmailError(err);
    if (err) return;
    setBusy(true);
    setFormError(null);
    try {
      const user = await logIn(email, password);
      const profile = getProfile(user.id);
      navigate(
        from ??
          (user.role === 'admin'
            ? '/admin'
            : profile?.onboardingComplete
              ? '/explore'
              : '/profile'),
      );
    } catch (e2) {
      setFormError(e2 instanceof Error ? e2.message : 'Login failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard title="Log in" intro="Accounts exist only in the browser where they were created.">
      {formError && (
        <Notice tone="alert" live>
          {formError}
        </Notice>
      )}
      <form onSubmit={(e) => void onSubmit(e)} noValidate className="space-y-4">
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          error={emailError}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" variant="primary" className="w-full" disabled={busy}>
          {busy ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
      <div className="flex flex-wrap justify-between gap-2 text-sm">
        <Link to="/reset" className="font-medium text-accent-strong underline">
          Forgot password?
        </Link>
        <Link to="/signup" className="font-medium text-accent-strong underline">
          Create an account
        </Link>
      </div>
      <details className="disclosure rounded-2xl bg-tint p-4 text-sm">
        <summary className="cursor-pointer font-medium">Demo admin account</summary>
        <p className="mt-2 text-ink-soft">
          Email <code>{DEMO_ADMIN.email}</code>, password <code>{DEMO_ADMIN.password}</code>.
          Prototype only.
        </p>
      </details>
    </AuthCard>
  );
}
