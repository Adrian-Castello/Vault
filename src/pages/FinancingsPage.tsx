import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { FinancingList } from '../components/Financings/FinancingList'
import { FinancingForm } from '../components/Financings/FinancingForm'
import { PageHeader } from '../components/ui/PageHeader'
import {
  formatEuroSmart,
  totalMonthlyFinancings,
  totalRemainingDebt,
} from '../lib/calculations'
import type { Financing } from '../lib/types'
import type { AppOutletContext } from '../App'

export function FinancingsPage() {
  const { financings, modal, setModal } = useOutletContext<AppOutletContext>()
  const [editing, setEditing] = useState<Financing | null>(null)

  const monthly = totalMonthlyFinancings(financings.data)
  const debt = totalRemainingDebt(financings.data)

  const open = modal === 'financing' || editing !== null

  const handleClose = () => {
    setEditing(null)
    setModal(null)
  }

  return (
    <div>
      <PageHeader
        title="Financiaciones"
        subtitle={
          <span className="flex flex-wrap gap-x-3 gap-y-1">
            <span>
              Cuotas activas/mes:{' '}
              <span className="text-ink font-medium tabular-nums">
                {formatEuroSmart(monthly)}
              </span>
            </span>
            <span className="hidden sm:inline text-muted">·</span>
            <span>
              Deuda pendiente:{' '}
              <span className="text-ink font-medium tabular-nums">
                {formatEuroSmart(debt)}
              </span>
            </span>
          </span>
        }

      />

      <FinancingList
        items={financings.data}
        loading={financings.loading}
        onItemClick={(f) => setEditing(f)}
        onCreate={() => setModal('financing')}
      />

      <FinancingForm
        open={open}
        onClose={handleClose}
        existing={editing}
        onSubmit={async (input) => {
          if (editing) {
            await financings.update(editing.id, input)
          } else {
            await financings.create(input)
          }
        }}
        onDelete={
          editing
            ? async () => {
                await financings.remove(editing.id)
              }
            : undefined
        }
      />
    </div>
  )
}
