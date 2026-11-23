import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button, Notice, TextField } from '../../components/ui';
import { resetPassword } from '../../data/auth';
import { AuthCard } from './AuthCard';
import { hasErrors, validateEmail, validatePassword, type FieldErrors } from './validation';

export default function ResetPasswordPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors<'email' | 'password'>>({});
  const [status, setStatus] = useState<{ tone: 'success' | 'alert'; text: string } | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next: FieldErrors<'email' | 'password'> = {};
    const emailErr = validateEmail(form.email);
    const pwErr = validatePassword(form.password);
    if (emailErr) next.email = emailErr;
    if (pwErr) next.password = pwErr;
    setErrors(next);
    if (hasErrors(next)) return;
    try {
      await resetPassword(form.email, form.password);
      setStatus({
        tone: 'success',
        text: 'Password updated. You can log in with the new password.',
      });
    } catch (err) {
      setStatus({ tone: 'alert', text: err instanceof Error ? err.message : 'Reset failed.' });
    }
  }

  return (
    <AuthCard title="Reset password">
      <Notice tone="caution" title="Prototype reset flow">
        No email is sent and there is no verification step. Anyone using this browser can reset an
        account stored here. A real deployment would send a verification link instead.
      </Notice>
      {status && (
        <Notice tone={status.tone} live>
          {status.text}
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
          label="New password"
          type="password"
          autoComplete="new-password"
          required
          hint="At least 8 characters."
          value={form.password}
          error={errors.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Button type="submit" variant="primary" className="w-full">
          Set new password
        </Button>
      </form>
      <Link to="/login" className="text-sm font-medium text-accent-strong underline">
        Back to log in
      </Link>
    </AuthCard>
  );
}
