import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { FinancingList } from '../components/Financings/FinancingList'
import { FinancingForm } from '../components/Financings/FinancingForm'
import { FinancingsKpis } from '../components/Financings/FinancingsKpis'
import { PageHeader } from '../components/ui/PageHeader'
import type { Financing } from '../lib/types'
import type { AppOutletContext } from '../App'

export function FinancingsPage() {
  const { financings, modal, setModal } = useOutletContext<AppOutletContext>()
  const [editing, setEditing] = useState<Financing | null>(null)

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
          <span className="text-muted">Tus pagos a plazos y tu camino libre de deuda.</span>
        }
      />

      {!financings.loading && financings.data.length > 0 && (
        <FinancingsKpis items={financings.data} />
      )}

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
