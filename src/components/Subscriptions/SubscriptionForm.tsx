import { useEffect, useState, type FormEvent } from 'react'
import { Trash2, RefreshCw } from 'lucide-react'
import type { Subscription, SubscriptionInput, SubscriptionStatus } from '../../lib/types'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Field, Input, Select } from '../ui/Input'
import { EmojiPicker } from '../ui/EmojiPicker'
import { toISODate } from '../../lib/dates'
import { useCategories, findCategory } from '../../lib/categories'
import { useUnsavedChanges } from '../../hooks/useUnsavedChanges'

interface Props {
  open: boolean
  onClose: () => void
  existing?: Subscription | null
  onSubmit: (input: SubscriptionInput) => Promise<void> | void
  onDelete?: () => Promise<void> | void
  onCancel?: () => Promise<void> | void   // marcar como 'cancelled'
  onReactivate?: () => Promise<void> | void
}

interface FormState {
  name: string
  emoji: string
  price: string
  billing_cycle: Subscription['billing_cycle']
  next_charge_date: string
  category: string
  status: SubscriptionStatus
  trial_end_date: string
  payment_method: string
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
      category: 'general',
      status: 'active',
      trial_end_date: '',
      payment_method: '',
    }
  }
  return {
    name: s.name,
    emoji: s.emoji || '✨',
    price: String(s.price),
    billing_cycle: s.billing_cycle,
    next_charge_date: s.next_charge_date,
    category: s.category || 'general',
    status: s.status || 'active',
    trial_end_date: s.trial_end_date || '',
    payment_method: s.payment_method || '',
  }
}

export function SubscriptionForm({
  open,
  onClose,
  existing,
  onSubmit,
  onDelete,
  onCancel,
  onReactivate,
}: Props) {
  const isEdit = Boolean(existing)
  const isCancelled = existing?.status === 'cancelled'
  const [state, setState] = useState<FormState>(initialFromExisting(existing))
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { categories } = useCategories()
  const { confirmClose } = useUnsavedChanges(open, state)

  const handleSafeClose = () => confirmClose(onClose)

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
    if (!Number.isFinite(price) || price < 0) e.price = 'Importe inválido'
    if (!state.next_charge_date) e.next_charge_date = 'Fecha requerida'
    if (state.status === 'trial' && !state.trial_end_date) {
      e.trial_end_date = 'Fecha de fin de prueba requerida'
    }
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
        category: state.category,
        status: state.status,
        trial_end_date: state.status === 'trial' ? state.trial_end_date : null,
        cancelled_at: existing?.cancelled_at ?? null,
        payment_method: state.payment_method.trim() || null,
      })
      onClose()
    } catch {
      // toast handled in hook
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

  const handleReactivate = async () => {
    if (!onReactivate) return
    setSubmitting(true)
    try {
      await onReactivate()
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  const currentCategory = findCategory(categories, state.category)

  return (
    <Modal
      open={open}
      onClose={handleSafeClose}
      title={isEdit ? 'Editar suscripción' : 'Nueva suscripción'}
      subtitle={isEdit ? 'Modifica los detalles abajo' : 'Añade un cobro recurrente'}
      footer={
        <div className="flex items-center gap-2 flex-wrap">
          {isEdit && isCancelled && onReactivate && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleReactivate}
              disabled={submitting}
              className="mr-auto"
              icon={<RefreshCw className="h-4 w-4" />}
            >
              Reactivar
            </Button>
          )}
          {isEdit && onDelete && (
            <Button
              type="button"
              variant={confirmDelete ? 'danger' : 'ghost'}
              size="md"
              onClick={handleDelete}
              disabled={submitting}
              icon={<Trash2 className="h-4 w-4" />}
            >
              {confirmDelete ? 'Confirmar eliminar' : 'Eliminar'}
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={handleSafeClose} disabled={submitting}>
            Cerrar
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
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
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
              <option value="semiannual">Semestral</option>
              <option value="yearly">Anual</option>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Categoría">
            <Select
              value={state.category}
              onChange={(e) => setState((s) => ({ ...s, category: e.target.value }))}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
              ))}
            </Select>
          </Field>

          <Field label="Estado">
            <Select
              value={state.status}
              onChange={(e) =>
                setState((s) => ({ ...s, status: e.target.value as SubscriptionStatus }))
              }
            >
              <option value="active">Activa</option>
              <option value="trial">Prueba</option>
              <option value="paused">Pausada</option>
              {isCancelled && <option value="cancelled">Cancelada</option>}
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

        {state.status === 'trial' && (
          <Field label="Fin del periodo de prueba" required error={errors.trial_end_date}>
            <Input
              type="date"
              value={state.trial_end_date}
              onChange={(e) =>
                setState((s) => ({ ...s, trial_end_date: e.target.value }))
              }
            />
          </Field>
        )}

        <Field label="Método de pago" hint="Para saber dónde ir si quieres cancelarlo">
          <Input
            value={state.payment_method}
            onChange={(e) => setState((s) => ({ ...s, payment_method: e.target.value }))}
            placeholder="BBVA, Revolut, PayPal…"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            maxLength={60}
          />
        </Field>

        {/* Indicador visual de categoría seleccionada */}
        <div
          className="rounded-xl border border-dashed border-subtle px-4 py-3 flex items-center gap-3 text-sm"
          style={{ background: `${currentCategory.color}10` }}
        >
          <span
            className="h-8 w-8 rounded-lg flex items-center justify-center text-lg shrink-0"
            style={{ background: `${currentCategory.color}22`, color: currentCategory.color }}
          >
            {currentCategory.emoji}
          </span>
          <span className="text-muted">
            Categoría: <span className="text-ink font-medium">{currentCategory.label}</span>
          </span>
        </div>
      </form>
    </Modal>
  )
}
