import { ReactNode } from 'react'

interface Props {
  title: string | ReactNode
  subtitle?: ReactNode
  trailing?: ReactNode
}

export function PageHeader({ title, subtitle, trailing }: Props) {
  return (
    <header className="flex items-start justify-between gap-3 mb-6">
      <div className="min-w-0">
        <h1 className="text-[26px] md:text-3xl font-semibold tracking-tight text-ink leading-tight">
          {title}
        </h1>
        {subtitle && <div className="text-sm text-muted mt-1.5">{subtitle}</div>}
      </div>
      {trailing && (
        <div className="flex items-center gap-2 shrink-0">
          {trailing}
        </div>
      )}
    </header>
  )
}
