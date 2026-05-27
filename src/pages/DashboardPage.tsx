import { useOutletContext } from 'react-router-dom'
import { Upcoming7Days } from '../components/Dashboard/Upcoming7Days'
import { KpiGrid } from '../components/Dashboard/KpiGrid'
import { SpendChart } from '../components/Dashboard/SpendChart'
import { PageHeader } from '../components/ui/PageHeader'
import { Skeleton } from '../components/ui/Skeleton'
import type { AppOutletContext } from '../App'

export function DashboardPage() {
  const { subscriptions, financings } = useOutletContext<AppOutletContext>()
  const loading = subscriptions.loading || financings.loading

  const hour = new Date().getHours()
  const greet = hour < 6 ? 'Buenas noches' : hour < 13 ? 'Buenos días' : hour < 21 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="space-y-5 md:space-y-6">
      <PageHeader
        title={`${greet} 👋`}
        subtitle={
          <span>
            Aquí está tu pulso financiero de hoy,{' '}
            <span className="text-ink">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>.
          </span>
        }
      />

      {loading ? (
        <div className="space-y-5">
          <Skeleton className="h-[260px]" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <Skeleton className="h-[120px]" />
            <Skeleton className="h-[120px]" />
            <Skeleton className="h-[120px]" />
            <Skeleton className="h-[120px]" />
          </div>
          <Skeleton className="h-[340px]" />
        </div>
      ) : (
        <>
          <Upcoming7Days
            subscriptions={subscriptions.data}
            financings={financings.data}
          />
          <KpiGrid
            subscriptions={subscriptions.data}
            financings={financings.data}
          />
          <SpendChart
            subscriptions={subscriptions.data}
            financings={financings.data}
          />
        </>
      )}
    </div>
  )
}
