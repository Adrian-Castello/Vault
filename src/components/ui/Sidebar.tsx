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
    <aside className="hidden md:flex md:w-64 lg:w-72 flex-col border-r border-subtle bg-card/60 backdrop-blur-xl px-5 py-7 sticky top-0 h-screen relative overflow-hidden">
      {/* Halo decorativo de fondo arriba */}
      <div
        className="pointer-events-none absolute -top-24 -left-20 h-56 w-56 rounded-full opacity-25 blur-3xl"
        style={{
          background:
            'radial-gradient(closest-side, rgba(110, 231, 183, 0.55), transparent 70%)',
        }}
        aria-hidden
      />
      {/* Halo decorativo de fondo abajo */}
      <div
        className="pointer-events-none absolute -bottom-32 -right-16 h-64 w-64 rounded-full opacity-20 blur-3xl"
        style={{
          background:
            'radial-gradient(closest-side, rgba(167, 139, 250, 0.5), transparent 70%)',
        }}
        aria-hidden
      />

      {/* Logo */}
      <div className="relative px-1 mb-8 flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-xl blur-md opacity-60 bg-gradient-to-br from-mint to-violet" aria-hidden />
          <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-mint to-violet flex items-center justify-center text-white shadow-lg">
            <Sparkles className="h-4 w-4" strokeWidth={2.4} />
          </div>
        </div>
        <div className="leading-tight">
          <div className="text-[15px] font-semibold tracking-tight text-ink">Vault</div>
          <div className="text-[11px] text-muted tracking-wide">tus pagos, claros</div>
        </div>
      </div>

      {/* Separador con label */}
      <div className="relative px-1 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50">
          Menú
        </span>
      </div>

      {/* Navegación */}
      <nav className="relative flex-1">
        <ul className="space-y-1.5">
          {items.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-white shadow-sm'
                      : 'text-muted hover:bg-[var(--border)]/40 hover:text-ink'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-mint to-violet"
                        aria-hidden
                      />
                    )}
                    {isActive && (
                      <span
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-mint to-violet blur-md opacity-40 -z-10"
                        aria-hidden
                      />
                    )}
                    <Icon className="relative h-[18px] w-[18px]" strokeWidth={isActive ? 2.4 : 2} />
                    <span className="relative">{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer: Ajustes + Tema */}
      <div className="relative pt-4 mt-4 border-t border-subtle">
        <span className="block px-1 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-ink/50">
          Cuenta
        </span>
        <button
          type="button"
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted hover:bg-[var(--border)]/40 hover:text-ink transition-colors"
        >
          <Settings className="h-[18px] w-[18px]" strokeWidth={2} />
          <span>Ajustes</span>
        </button>
        <div className="flex items-center justify-between rounded-xl px-3.5 py-2 mt-1">
          <span className="text-sm text-muted">Tema</span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}
