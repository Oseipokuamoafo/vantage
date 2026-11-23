export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'inverse';
export type ButtonSize = 'sm' | 'md';

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-150 ease-out active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100 min-h-[44px]';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.18)] hover:bg-accent-strong hover:shadow-lift',
  secondary:
    'border border-line-strong bg-paper-raised text-ink hover:border-ink hover:bg-paper-sunk',
  ghost:
    'text-accent-strong underline decoration-transparent decoration-2 underline-offset-4 hover:decoration-current',
  inverse: 'border border-white/30 text-white hover:border-white hover:bg-white/10',
  danger:
    'border border-alert/40 bg-paper-raised text-alert hover:border-alert hover:bg-alert-soft',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 text-sm min-h-[40px]',
  md: 'px-5 text-sm sm:text-base',
};

export function buttonClass(variant: ButtonVariant = 'secondary', size: ButtonSize = 'md'): string {
  return `${base} ${variants[variant]} ${sizes[size]}`;
}

export const inputClass =
  'block w-full rounded-xl border border-line-strong bg-paper-raised px-3 py-2 text-base text-ink placeholder:text-ink-muted transition-colors hover:border-ink-soft focus:border-accent aria-[invalid=true]:border-alert min-h-[44px]';
