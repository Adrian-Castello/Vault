import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { SubscriptionList } from '../components/Subscriptions/SubscriptionList'
import { SubscriptionForm } from '../components/Subscriptions/SubscriptionForm'
import { SubscriptionsKpis } from '../components/Subscriptions/SubscriptionsKpis'
import { PageHeader } from '../components/ui/PageHeader'
import type { Subscription } from '../lib/types'
import type { AppOutletContext } from '../App'

export function SubscriptionsPage() {
  const { subscriptions, modal, setModal } = useOutletContext<AppOutletContext>()
  const [editing, setEditing] = useState<Subscription | null>(null)

  const open = modal === 'subscription' || editing !== null

  const handleClose = () => {
    setEditing(null)
    setModal(null)
  }

  return (
    <div>
      <PageHeader
        title="Suscripciones"
        subtitle={
          <span className="text-muted">
            Gestiona todos tus cobros recurrentes en un solo sitio.
          </span>
        }
      />

      {!subscriptions.loading && subscriptions.data.length > 0 && (
        <SubscriptionsKpis items={subscriptions.data} />
      )}

      <SubscriptionList
        items={subscriptions.data}
        loading={subscriptions.loading}
        onItemClick={(s) => setEditing(s)}
        onCreate={() => setModal('subscription')}
      />

      <SubscriptionForm
        open={open}
        onClose={handleClose}
        existing={editing}
        onSubmit={async (input) => {
          if (editing) {
            await subscriptions.update(editing.id, input)
          } else {
            await subscriptions.create(input)
          }
        }}
        onDelete={
          editing
            ? async () => {
                await subscriptions.remove(editing.id)
              }
            : undefined
        }
        onCancel={
          editing
            ? async () => {
                await subscriptions.cancel(editing.id)
              }
            : undefined
        }
        onReactivate={
          editing
            ? async () => {
                await subscriptions.reactivate(editing.id)
              }
            : undefined
        }
      />
    </div>
  )
}
