import { useEffect, useState } from 'react'
import {
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { Sidebar } from './components/ui/Sidebar'
import { BottomNav } from './components/ui/BottomNav'
import { FloatingAddButton } from './components/ui/FloatingAddButton'
import { Toaster } from './components/ui/Toaster'
import { useSubscriptions } from './hooks/useSubscriptions'
import { useFinancings } from './hooks/useFinancings'
import { DashboardPage } from './pages/DashboardPage'
import { SubscriptionsPage } from './pages/SubscriptionsPage'
import { FinancingsPage } from './pages/FinancingsPage'
import { SettingsPage } from './pages/SettingsPage'
import { SubscriptionForm } from './components/Subscriptions/SubscriptionForm'
import { FinancingForm } from './components/Financings/FinancingForm'
import { isSupabaseConfigured } from './lib/supabase'

type ModalKind = 'subscription' | 'financing' | null
type RouteContext = 'subscription' | 'financing' | 'dashboard' | 'settings'

export interface AppOutletContext {
  subscriptions: ReturnType<typeof useSubscriptions>
  financings: ReturnType<typeof useFinancings>
  modal: ModalKind
  setModal: (m: ModalKind) => void
}

/**
 * Al cambiar de ruta, scroll arriba del todo (instantáneo).
 * Si no hay scroll en window (móvil PWA con safe area), también ajusta el
 * contenedor principal.
 */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
    // Fallback: scroll del <main> por si el body no tiene overflow
    const main = document.querySelector('main')
    if (main) main.scrollTop = 0
  }, [pathname])
  return null
}

function Shell() {
  const subscriptions = useSubscriptions()
  const financings = useFinancings()
  const [modal, setModal] = useState<ModalKind>(null)
  const location = useLocation()

  const path = location.pathname
  const context: RouteContext = routeContext(path)

  const contextValue: AppOutletContext = {
    subscriptions,
    financings,
    modal,
    setModal,
  }

  return (
    <div className="min-h-full flex bg-surface">
      <ScrollToTop />
      <Sidebar />
      <main className="flex-1 min-w-0 pb-28 md:pb-10 px-4 sm:px-6 md:px-10 pt-8 md:pt-8 max-w-6xl mx-auto w-full safe-top">
        {!isSupabaseConfigured && <ConfigBanner />}
        <Outlet context={contextValue} />
      </main>

      <BottomNav
        onAddSubscription={() => setModal('subscription')}
        onAddFinancing={() => setModal('financing')}
      />

      <FloatingAddButton
        context={context}
        onAddSubscription={() => setModal('subscription')}
        onAddFinancing={() => setModal('financing')}
      />

      {/* Los formularios desde el FAB del Dashboard */}
      {path === '/' && (
        <>
          <SubscriptionForm
            open={modal === 'subscription'}
            onClose={() => setModal(null)}
            onSubmit={async (input) => {
              await subscriptions.create(input)
            }}
          />
          <FinancingForm
            open={modal === 'financing'}
            onClose={() => setModal(null)}
            onSubmit={async (input) => {
              await financings.create(input)
            }}
          />
        </>
      )}

      <Toaster />
    </div>
  )
}

function routeContext(path: string): RouteContext {
  if (path.startsWith('/suscripciones')) return 'subscription'
  if (path.startsWith('/financiaciones')) return 'financing'
  if (path.startsWith('/ajustes')) return 'settings'
  return 'dashboard'
}

function ConfigBanner() {
  return (
    <div className="card border-warm/40 bg-warm/8 mb-5 px-4 py-3 text-sm flex items-start gap-3">
      <div className="text-base">⚠️</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-ink">Supabase no configurado</p>
        <p className="text-muted text-xs mt-0.5">
          Crea un archivo <code className="font-mono">.env</code> con{' '}
          <code className="font-mono">VITE_SUPABASE_URL</code> y{' '}
          <code className="font-mono">VITE_SUPABASE_ANON_KEY</code>. Mira el README.
        </p>
      </div>
    </div>
  )
}

export function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/suscripciones" element={<SubscriptionsPage />} />
        <Route path="/financiaciones" element={<FinancingsPage />} />
        <Route path="/ajustes" element={<SettingsPage />} />
        <Route path="*" element={<DashboardPage />} />
      </Route>
    </Routes>
  )
}
