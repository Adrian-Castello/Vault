import { useOutletContext } from 'react-router-dom'
import { Upcoming7Days } from '../components/Dashboard/Upcoming7Days'
import { KpiGrid } from '../components/Dashboard/KpiGrid'
import { RenewalCalendar } from '../components/Dashboard/RenewalCalendar'
import { CategoryDonut } from '../components/Dashboard/CategoryDonut'
import { PageHeader } from '../components/ui/PageHeader'
import { Skeleton } from '../components/ui/Skeleton'
import { useUserName } from '../hooks/useUserName'
import type { AppOutletContext } from '../App'

export function DashboardPage() {
  const { subscriptions, financings } = useOutletContext<AppOutletContext>()
  const { name } = useUserName()
  const loading = subscriptions.loading || financings.loading

  const hour = new Date().getHours()
  const greet =
    hour < 6 ? 'Buenas noches' :
    hour < 13 ? 'Buenos días' :
    hour < 21 ? 'Buenas tardes' :
    'Buenas noches'

  const greetingTitle = name ? `${greet}, ${name} 👋` : `${greet} 👋`

  return (
    <div className="space-y-5 md:space-y-6">
      <PageHeader
        title={greetingTitle}
        subtitle={
          <span>
            Hoy es{' '}
            <span className="text-ink">
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long', day: 'numeric', month: 'long',
              })}
            </span>
            .
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
          <Skeleton className="h-[360px]" />
          <Skeleton className="h-[280px]" />
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
          <RenewalCalendar
            subscriptions={subscriptions.data}
            financings={financings.data}
          />
          <CategoryDonut
            subscriptions={subscriptions.data}
            financings={financings.data}
          />
        </>
      )}
    </div>
  )
}
