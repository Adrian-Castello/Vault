import { useEffect, useState, type FormEvent } from 'react'
import { Trash2 } from 'lucide-react'
import type { Subscription, SubscriptionInput } from '../../lib/types'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Field, Input, Select } from '../ui/Input'
import { EmojiPicker } from '../ui/EmojiPicker'
import { toISODate } from '../../lib/dates'

interface Props {
  open: boolean
  onClose: () => void
  existing?: Subscription | null
  onSubmit: (input: SubscriptionInput) => Promise<void> | void
  onDelete?: () => Promise<void> | void
}

interface FormState {
  name: string
  emoji: string
  price: string
  billing_cycle: Subscription['billing_cycle']
  next_charge_date: string
}

function todayISO() {
  return toISODate(new Date())
}

function initialFromExisting(s: Subscription | null | undefined): FormState {
  if (!s) {
    return {
      name: '',
      emoji: '✨',
      price: '',
      billing_cycle: 'monthly',
      next_charge_date: todayISO(),
    }
  }
  return {
    name: s.name,
    emoji: s.emoji || '✨',
    price: String(s.price),
    billing_cycle: s.billing_cycle,
    next_charge_date: s.next_charge_date,
  }
}

export function SubscriptionForm({
  open,
  onClose,
  existing,
  onSubmit,
  onDelete,
}: Props) {
  const isEdit = Boolean(existing)
  const [state, setState] = useState<FormState>(initialFromExisting(existing))
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (open) {
      setState(initialFromExisting(existing))
      setErrors({})
      setConfirmDelete(false)
    }
  }, [open, existing])

  const validate = (): boolean => {
    const e: typeof errors = {}
    if (!state.name.trim()) e.name = 'Pon un nombre'
    const price = parseFloat(state.price.replace(',', '.'))
    if (!Number.isFinite(price) || price <= 0) e.price = 'Importe inválido'
    if (!state.next_charge_date) e.next_charge_date = 'Fecha requerida'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await onSubmit({
        name: state.name.trim(),
        emoji: state.emoji,
        price: parseFloat(state.price.replace(',', '.')),
        billing_cycle: state.billing_cycle,
        next_charge_date: state.next_charge_date,
      })
      onClose()
    } catch {
      // toast already handled in hook
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setSubmitting(true)
    try {
      await onDelete()
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar suscripción' : 'Nueva suscripción'}
      subtitle={isEdit ? 'Modifica los detalles abajo' : 'Añade un cobro recurrente'}
      footer={
        <div className="flex items-center gap-2">
          {isEdit && onDelete && (
            <Button
              type="button"
              variant={confirmDelete ? 'danger' : 'ghost'}
              size="md"
              onClick={handleDelete}
              disabled={submitting}
              className="mr-auto"
              icon={<Trash2 className="h-4 w-4" />}
            >
              {confirmDelete ? 'Confirmar eliminar' : 'Eliminar'}
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="subscription-form"
            disabled={submitting}
            variant="primary"
          >
            {submitting ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear'}
          </Button>
        </div>
      }
    >
      <form id="subscription-form" onSubmit={handleSubmit} className="space-y-4 py-1">
        <div className="flex gap-4 items-start">
          <div className="pt-5">
            <EmojiPicker
              value={state.emoji}
              onChange={(emoji) => setState((s) => ({ ...s, emoji }))}
            />
          </div>
          <div className="flex-1">
            <Field label="Nombre" required error={errors.name}>
              <Input
                value={state.name}
                onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
                placeholder="Netflix, Spotify…"
                autoFocus
              />
            </Field>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Precio (€)" required error={errors.price}>
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={state.price}
              onChange={(e) => setState((s) => ({ ...s, price: e.target.value }))}
              placeholder="9.99"
            />
          </Field>

          <Field label="Ciclo" required>
            <Select
              value={state.billing_cycle}
              onChange={(e) =>
                setState((s) => ({
                  ...s,
                  billing_cycle: e.target.value as Subscription['billing_cycle'],
                }))
              }
            >
              <option value="monthly">Mensual</option>
              <option value="quarterly">Trimestral</option>
              <option value="yearly">Anual</option>
            </Select>
          </Field>
        </div>

        <Field label="Próximo cobro" required error={errors.next_charge_date}>
          <Input
            type="date"
            value={state.next_charge_date}
            onChange={(e) =>
              setState((s) => ({ ...s, next_charge_date: e.target.value }))
            }
          />
        </Field>
      </form>
    </Modal>
  )
}
