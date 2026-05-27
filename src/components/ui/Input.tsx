import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react'

interface FieldProps {
  label: string
  hint?: string
  error?: string
  children: ReactNode
  required?: boolean
}

export function Field({ label, hint, error, children, required }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted uppercase tracking-wider">
        {label}
        {required && <span className="text-alert ml-0.5">*</span>}
      </span>
      {children}
      {hint && !error && <span className="text-xs text-muted">{hint}</span>}
      {error && <span className="text-xs text-alert">{error}</span>}
    </label>
  )
}

const inputBase =
  'h-11 w-full rounded-xl bg-[var(--bg)] dark:bg-[var(--card)] border border-[var(--border)] px-3.5 text-[15px] text-ink placeholder:text-muted/70 transition-colors duration-200 outline-none focus:border-[var(--ink)]/40 focus:ring-2 focus:ring-[var(--ink)]/5'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = '', ...rest }, ref) {
    return <input ref={ref} className={`${inputBase} ${className}`} {...rest} />
  },
)

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className = '', children, ...rest }, ref) {
  return (
    <select
      ref={ref}
      className={`${inputBase} appearance-none bg-no-repeat pr-9 cursor-pointer ${className}`}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
        backgroundPosition: 'right 0.85rem center',
        backgroundSize: '14px',
      }}
      {...rest}
    >
      {children}
    </select>
  )
})
