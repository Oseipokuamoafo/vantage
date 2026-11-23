import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { inputClass } from './styles';

interface FieldShellProps {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

function FieldShell({ id, label, hint, error, required, children }: FieldShellProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-navy">
        {label}
        {required ? (
          <span className="font-normal text-muted"> (required)</span>
        ) : (
          <span className="font-normal text-muted"> (optional)</span>
        )}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          className="flex items-start gap-1.5 text-sm font-semibold text-danger"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            aria-hidden="true"
            className="mt-0.5 shrink-0"
          >
            <circle cx="8" cy="8" r="7" fill="currentColor" />
            <path d="M8 4.5v4.2M8 11v.3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span>
            <span className="sr-only">Error: </span>
            {error}
          </span>
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, hint: unknown, error: unknown): string | undefined {
  const ids = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean);
  return ids.length ? ids.join(' ') : undefined;
}

type BaseProps = { label: string; hint?: ReactNode; error?: string };

export function TextField({
  label,
  hint,
  error,
  required,
  id: idProp,
  ...rest
}: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <input
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={inputClass}
        {...rest}
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  hint,
  error,
  required,
  id: idProp,
  children,
  ...rest
}: BaseProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <select
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={inputClass}
        {...rest}
      >
        {children}
      </select>
    </FieldShell>
  );
}

export function TextAreaField({
  label,
  hint,
  error,
  required,
  id: idProp,
  ...rest
}: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <textarea
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={`${inputClass} min-h-[112px] py-3`}
        {...rest}
      />
    </FieldShell>
  );
}
