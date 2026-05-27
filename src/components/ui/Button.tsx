import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium tracking-tight transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] focus-visible:ring-[var(--ink)] select-none'

const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
}

const variants: Record<Variant, string> = {
  primary:
    'bg-[var(--ink)] text-[var(--bg)] hover:opacity-90 active:scale-[0.98] shadow-sm',
  secondary:
    'bg-[var(--card)] text-[var(--ink)] border border-[var(--border)] hover:border-[var(--ink)]/30 active:scale-[0.98]',
  ghost:
    'bg-transparent text-[var(--ink)] hover:bg-[var(--border)]/40',
  danger:
    'bg-[var(--alert)] text-white hover:opacity-90 active:scale-[0.98]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', icon, className = '', children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
})
