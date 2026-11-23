import { useId, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { buttonClass, inputClass } from '../../../components/ui';

/** Inline email row. Prototype: routes to sign-up with the email prefilled; nothing is sent anywhere. */
export function EmailCapture({ align = 'center' }: { align?: 'center' | 'left' }) {
  const id = useId();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    navigate(trimmed ? `/signup?email=${encodeURIComponent(trimmed)}` : '/signup');
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:items-center sm:gap-2 sm:rounded-full sm:border sm:border-border sm:bg-surface sm:p-1.5 sm:shadow-soft ${
        align === 'center' ? 'mx-auto' : ''
      }`}
    >
      <label htmlFor={id} className="sr-only">
        Email address
      </label>
      <input
        id={id}
        type="email"
        autoComplete="email"
        placeholder="you@school.edu"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={`${inputClass} sm:min-h-[44px] sm:flex-1 sm:rounded-full sm:border-transparent sm:shadow-none sm:hover:border-transparent`}
      />
      <button type="submit" className={`${buttonClass('primary')} sm:min-h-[44px]`}>
        Start planning
      </button>
    </form>
  );
}
