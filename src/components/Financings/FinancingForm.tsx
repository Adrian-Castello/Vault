import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Trash2 } from 'lucide-react'
import type { Financing, FinancingInput } from '../../lib/types'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Field, Input } from '../ui/Input'
import { EmojiPicker } from '../ui/EmojiPicker'
import { addMonths, formatFullDate, parseISODate, toISODate } from '../../lib/dates'

interface Props {
  open: boolean
  onClose: () => void
  existing?: Financing | null
  onSubmit: (input: FinancingInput) => Promise<void> | void
  onDelete?: () => Promise<void> | void
}

interface FormState {
  name: string
  emoji: string
  total_amount: string
  monthly_payment: string
  total_installments: string
  paid_installments: string
  next_charge_date: string
}

function todayISO() {
  return toISODate(new Date())
}

function initialFromExisting(f: Financing | null | undefined): FormState {
  if (!f) {
    return {
      name: '',
      emoji: '💳',
      total_amount: '',
      monthly_payment: '',
      total_installments: '',
      paid_installments: '0',
      next_charge_date: todayISO(),
    }
  }
  return {
    name: f.name,
    emoji: f.emoji || '💳',
    total_amount: String(f.total_amount),
    monthly_payment: String(f.monthly_payment),
    total_installments: String(f.total_installments),
    paid_installments: String(f.paid_installments),
    next_charge_date: f.next_charge_date,
  }
}

function calcEndDate(state: FormState): string | null {
  const total = parseInt(state.total_installments, 10)
  const paid = parseInt(state.paid_installments, 10)
  if (!state.next_charge_date || !Number.isFinite(total)) return null
  const remaining = total - (Number.isFinite(paid) ? paid : 0)
  if (remaining <= 0) {
    // If already finished, end was at the last paid month — approximate
    // by going back from next_charge_date.
    return state.next_charge_date
  }
  const start = parseISODate(state.next_charge_date)
  const end = addMonths(start, remaining - 1)
  return toISODate(end)
}

export function FinancingForm({ open, onClose, existing, onSubmit, onDelete }: Props) {
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

  const endDate = useMemo(() => calcEndDate(state), [state])

  const validate = (): boolean => {
    const e: typeof errors = {}
    if (!state.name.trim()) e.name = 'Pon un nombre'

    const total = parseFloat(state.total_amount.replace(',', '.'))
    if (!Number.isFinite(total) || total <= 0) e.total_amount = 'Importe inválido'

    const monthly = parseFloat(state.monthly_payment.replace(',', '.'))
    if (!Number.isFinite(monthly) || monthly <= 0) e.monthly_payment = 'Cuota inválida'

    const ti = parseInt(state.total_installments, 10)
    if (!Number.isFinite(ti) || ti <= 0) e.total_installments = 'Debe ser > 0'

    const pi = parseInt(state.paid_installments, 10)
    if (!Number.isFinite(pi) || pi < 0) e.paid_installments = 'Debe ser ≥ 0'
    else if (Number.isFinite(ti) && pi > ti)
      e.paid_installments = `No puede superar ${ti}`

    if (!state.next_charge_date) e.next_charge_date = 'Fecha requerida'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    const end = endDate ?? state.next_charge_date
    setSubmitting(true)
    try {
      await onSubmit({
        name: state.name.trim(),
        emoji: state.emoji,
        total_amount: parseFloat(state.total_amount.replace(',', '.')),
        monthly_payment: parseFloat(state.monthly_payment.replace(',', '.')),
        total_installments: parseInt(state.total_installments, 10),
        paid_installments: parseInt(state.paid_installments, 10),
        next_charge_date: state.next_charge_date,
        end_date: end,
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

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar financiación' : 'Nueva financiación'}
      subtitle={
        isEdit ? 'Modifica los detalles abajo' : 'Añade un pago a plazos sin intereses'
      }
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
            form="financing-form"
            disabled={submitting}
            variant="primary"
          >
            {submitting ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear'}
          </Button>
        </div>
      }
    >
      <form id="financing-form" onSubmit={handleSubmit} className="space-y-4 py-1">
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
                placeholder="iPhone, sofá…"
                autoFocus
              />
            </Field>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Importe total (€)" required error={errors.total_amount}>
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={state.total_amount}
              onChange={(e) => setState((s) => ({ ...s, total_amount: e.target.value }))}
              placeholder="1200"
            />
          </Field>

          <Field label="Cuota mensual (€)" required error={errors.monthly_payment}>
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={state.monthly_payment}
              onChange={(e) =>
                setState((s) => ({ ...s, monthly_payment: e.target.value }))
              }
              placeholder="100"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Nº cuotas total" required error={errors.total_installments}>
            <Input
              type="number"
              inputMode="numeric"
              min="1"
              value={state.total_installments}
              onChange={(e) =>
                setState((s) => ({ ...s, total_installments: e.target.value }))
              }
              placeholder="12"
            />
          </Field>

          <Field label="Cuotas pagadas" error={errors.paid_installments}>
            <Input
              type="number"
              inputMode="numeric"
              min="0"
              value={state.paid_installments}
              onChange={(e) =>
                setState((s) => ({ ...s, paid_installments: e.target.value }))
              }
              placeholder="0"
            />
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

        {endDate && (
          <div className="rounded-xl border border-dashed border-subtle bg-[var(--bg)] dark:bg-[var(--bg)] px-4 py-3 flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-medium text-muted">
              Fin previsto
            </span>
            <span className="text-sm font-medium text-ink tabular-nums">
              {formatFullDate(endDate)}
            </span>
          </div>
        )}
      </form>
    </Modal>
  )
}
