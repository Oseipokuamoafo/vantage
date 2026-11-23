export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'inverse';
export type ButtonSize = 'sm' | 'md';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition duration-brand ease-brand hover:-translate-y-px active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white shadow-soft hover:bg-primary-hover hover:shadow-hover active:bg-primary-active',
  secondary: 'border-[1.5px] border-primary bg-surface text-primary hover:bg-tint active:bg-tint',
  ghost:
    'text-primary underline decoration-transparent decoration-2 underline-offset-4 hover:translate-y-0 hover:decoration-current',
  danger: 'border-[1.5px] border-danger bg-surface text-danger hover:bg-danger-soft',
  // Kept for API compatibility; same as secondary on the light navbar.
  inverse: 'border-[1.5px] border-primary bg-surface text-primary hover:bg-tint',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-[40px] px-4 text-sm',
  md: 'min-h-[48px] px-7 text-[15px]',
};

export function buttonClass(variant: ButtonVariant = 'secondary', size: ButtonSize = 'md'): string {
  const pad = variant === 'ghost' ? 'px-1' : '';
  return `${base} ${variants[variant]} ${sizes[size]} ${pad}`;
}

export const inputClass =
  'block w-full min-h-[48px] rounded-input border border-border-strong bg-surface px-4 py-2 text-base text-navy placeholder:text-muted transition-colors duration-brand hover:border-navy focus:border-primary aria-[invalid=true]:border-danger';

export const chipBase =
  'inline-flex min-h-[40px] items-center gap-1.5 rounded-full border-[1.5px] px-4 text-sm font-semibold transition duration-brand ease-brand';

export function chipClass(selected = false, interactive = true): string {
  if (selected)
    return `${chipBase} border-primary bg-primary text-white ${interactive ? 'hover:bg-primary-hover' : ''}`;
  return `${chipBase} border-primary bg-surface text-navy ${interactive ? 'hover:-translate-y-px hover:bg-tint' : ''}`;
}
