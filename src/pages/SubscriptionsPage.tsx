import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { SubscriptionList } from '../components/Subscriptions/SubscriptionList'
import { SubscriptionForm } from '../components/Subscriptions/SubscriptionForm'
import { PageHeader } from '../components/ui/PageHeader'
import {
  formatEuroSmart,
  totalMonthlySubscriptions,
} from '../lib/calculations'
import type { Subscription } from '../lib/types'
import type { AppOutletContext } from '../App'

export function SubscriptionsPage() {
  const { subscriptions, modal, setModal, openSettings } = useOutletContext<AppOutletContext>()
  const [editing, setEditing] = useState<Subscription | null>(null)

  const total = totalMonthlySubscriptions(subscriptions.data)

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
          <span>
            Total mensual equivalente:{' '}
            <span className="text-ink font-medium tabular-nums">
              {formatEuroSmart(total)}
            </span>
          </span>
        }
        onOpenSettings={openSettings}
      />

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
