import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Notice, TextField } from '../../components/ui';
import { AuthError, signUp } from '../../data/auth';
import { AuthCard } from './AuthCard';
import { hasErrors, validateSignUp, type FieldErrors } from './validation';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<FieldErrors<'email' | 'password' | 'confirm'>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = validateSignUp(form);
    setErrors(next);
    if (hasErrors(next)) return;
    setBusy(true);
    setFormError(null);
    try {
      await signUp(form.email, form.password);
      navigate('/profile');
    } catch (err) {
      setFormError(
        err instanceof AuthError || err instanceof Error ? err.message : 'Sign-up failed.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard
      title="Create your account"
      intro="Free, and it stays on this device. Your account and data live only in this browser."
    >
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
          value={form.email}
          error={errors.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          hint="At least 8 characters."
          value={form.password}
          error={errors.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <TextField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          required
          value={form.confirm}
          error={errors.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
        />
        <Button type="submit" variant="primary" className="w-full" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
      <p className="text-sm text-ink-soft">
        Already have an account on this device?{' '}
        <Link to="/login" className="font-medium text-accent-strong underline">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
