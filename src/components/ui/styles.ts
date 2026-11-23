export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px]';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white hover:bg-accent-strong',
  secondary: 'border border-line-strong bg-paper-raised text-ink hover:bg-paper-sunk',
  ghost: 'text-accent-strong hover:bg-accent-soft',
  danger: 'border border-alert/40 bg-paper-raised text-alert hover:bg-alert-soft',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 text-sm min-h-[40px]',
  md: 'px-4 text-sm sm:text-base',
};

export function buttonClass(variant: ButtonVariant = 'secondary', size: ButtonSize = 'md'): string {
  return `${base} ${variants[variant]} ${sizes[size]}`;
}

export const inputClass =
  'block w-full rounded-lg border border-line-strong bg-paper-raised px-3 py-2 text-base text-ink placeholder:text-ink-muted aria-[invalid=true]:border-alert min-h-[44px]';
