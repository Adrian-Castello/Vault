import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Repeat, Wallet, Settings } from 'lucide-react'
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

      {/* Logo: Vault grande con gradient + frase corta */}
      <div className="relative px-1 mb-9">
        <h1
          className="text-[34px] font-bold tracking-tight leading-none bg-gradient-to-r from-mint via-mint to-violet bg-clip-text text-transparent"
          style={{ fontFamily: '"Inter", system-ui, sans-serif', letterSpacing: '-0.02em' }}
        >
          Vault
        </h1>
        <p className="mt-1.5 text-[11px] text-muted tracking-[0.15em] uppercase font-medium">
          Tu pulso financiero
        </p>
      </div>

      {/* Sección Menú */}
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

              {/* Ajustes inmediatamente debajo de Financiaciones, dentro de "Menú" */}
              {to === '/financiaciones' && (
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="mt-1.5 w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted hover:bg-[var(--border)]/40 hover:text-ink transition-colors"
                >
                  <Settings className="h-[18px] w-[18px]" strokeWidth={2} />
                  <span>Ajustes</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer: solo el tema, sin label */}
      <div className="relative pt-4 mt-4 border-t border-subtle">
        <div className="flex items-center justify-between rounded-xl px-3.5 py-2">
          <span className="text-sm text-muted">Tema</span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}
