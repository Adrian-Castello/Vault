import { ReactNode } from 'react'
import { Settings } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

interface Props {
  title: string | ReactNode
  subtitle?: ReactNode
  trailing?: ReactNode
  onOpenSettings?: () => void
}

export function PageHeader({ title, subtitle, trailing, onOpenSettings }: Props) {
  return (
    <header className="flex items-start justify-between gap-3 mb-6">
      <div className="min-w-0">
        <h1 className="text-[26px] md:text-3xl font-semibold tracking-tight text-ink leading-tight">
          {title}
        </h1>
        {subtitle && <div className="text-sm text-muted mt-1.5">{subtitle}</div>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {trailing}
        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Ajustes"
            className="md:hidden h-10 w-10 rounded-xl border border-subtle bg-card flex items-center justify-center transition-all duration-200 hover:border-[var(--ink)]/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]/20"
          >
            <Settings className="h-4 w-4 text-ink" />
          </button>
        )}
        <div className="md:hidden">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
