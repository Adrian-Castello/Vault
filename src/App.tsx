import { useState } from 'react'
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
import { SettingsModal } from './components/ui/SettingsModal'
import { useSubscriptions } from './hooks/useSubscriptions'
import { useFinancings } from './hooks/useFinancings'
import { DashboardPage } from './pages/DashboardPage'
import { SubscriptionsPage } from './pages/SubscriptionsPage'
import { FinancingsPage } from './pages/FinancingsPage'
import { SubscriptionForm } from './components/Subscriptions/SubscriptionForm'
import { FinancingForm } from './components/Financings/FinancingForm'
import { isSupabaseConfigured } from './lib/supabase'

type ModalKind = 'subscription' | 'financing' | null

export interface AppOutletContext {
  subscriptions: ReturnType<typeof useSubscriptions>
  financings: ReturnType<typeof useFinancings>
  modal: ModalKind
  setModal: (m: ModalKind) => void
  openSettings: () => void
}

function Shell() {
  const subscriptions = useSubscriptions()
  const financings = useFinancings()
  const [modal, setModal] = useState<ModalKind>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const location = useLocation()

  const path = location.pathname
  const context: ReturnType<typeof routeContext> = routeContext(path)

  const contextValue: AppOutletContext = {
    subscriptions,
    financings,
    modal,
    setModal,
    openSettings: () => setSettingsOpen(true),
  }

  return (
    <div className="min-h-full flex bg-surface">
      <Sidebar onOpenSettings={() => setSettingsOpen(true)} />
      <main className="flex-1 min-w-0 pb-28 md:pb-10 px-4 sm:px-6 md:px-10 pt-8 md:pt-8 max-w-5xl mx-auto w-full safe-top">
        {!isSupabaseConfigured && <ConfigBanner />}
        <Outlet context={contextValue} />
      </main>

      <BottomNav
        onAddSubscription={() => setModal('subscription')}
        onAddFinancing={() => setModal('financing')}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <FloatingAddButton
        context={context}
        onAddSubscription={() => setModal('subscription')}
        onAddFinancing={() => setModal('financing')}
      />

      {/* Modals available from the Dashboard FAB (the per-page editors handle their own state) */}
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

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <Toaster />
    </div>
  )
}

function routeContext(path: string): 'subscription' | 'financing' | 'dashboard' {
  if (path.startsWith('/suscripciones')) return 'subscription'
  if (path.startsWith('/financiaciones')) return 'financing'
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
        <Route path="*" element={<DashboardPage />} />
      </Route>
    </Routes>
  )
}
