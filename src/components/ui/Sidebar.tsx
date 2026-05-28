import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Repeat, Wallet, Sparkles, Settings } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

const items = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/suscripciones', label: 'Suscripciones', icon: Repeat, end: false },
  { to: '/financiaciones', label: 'Financiaciones', icon: Wallet, end: false },
]

interface Props {
  onOpenSettings: () => void
}

export function Sidebar({ onOpenSettings }: Props) {
  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 flex-col border-r border-subtle bg-card/40 px-4 py-6 sticky top-0 h-screen">
      <div className="px-2 mb-8 flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-mint to-violet flex items-center justify-center text-white shadow-sm">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight">Vault</div>
          <div className="text-[11px] text-muted">tus pagos, claros</div>
        </div>
      </div>

      <nav className="flex-1">
        <ul className="space-y-1">
          {items.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--ink)] text-[var(--bg)]'
                      : 'text-muted hover:bg-[var(--border)]/40 hover:text-ink'
                  }`
                }
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="pt-4 mt-4 border-t border-subtle space-y-1">
        <button
          type="button"
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:bg-[var(--border)]/40 hover:text-ink transition-colors"
        >
          <Settings className="h-[18px] w-[18px]" strokeWidth={2} />
          <span>Ajustes</span>
        </button>
        <div className="flex items-center justify-between px-3 pt-2">
          <span className="text-xs text-muted">Tema</span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}
