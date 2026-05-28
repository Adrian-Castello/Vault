import { useState } from 'react'
import { Pencil, Plus, Trash2, RotateCcw, Check } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Field, Input } from './Input'
import { useUserName } from '../../hooks/useUserName'
import { useCategories, slugify } from '../../lib/categories'
import { useToast } from '../../hooks/useToast'
import { supabase } from '../../lib/supabase'
import type { Category } from '../../lib/types'

interface Props {
  open: boolean
  onClose: () => void
}

const COLOR_OPTIONS = [
  '#EF4444', '#F59E0B', '#FBBF24', '#84CC16',
  '#10B981', '#34D399', '#06B6D4', '#0EA5E9',
  '#60A5FA', '#8B5CF6', '#A78BFA', '#EC4899',
  '#F97316', '#94A3B8', '#9CA3AF', '#6B7280',
]

export function SettingsModal({ open, onClose }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ajustes"
      subtitle="Personaliza tu Vault"
    >
      <div className="space-y-7 py-1">
        <UserNameSection />
        <div className="h-px bg-[var(--border)]" />
        <CategoriesSection />
      </div>
    </Modal>
  )
}

/* -------------------------------------------------------------------- */
/* Sección NOMBRE                                                       */
/* -------------------------------------------------------------------- */
function UserNameSection() {
  const { name, setName } = useUserName()
  const [draft, setDraft] = useState(name)
  const { push } = useToast()

  const dirty = draft.trim() !== name

  const save = () => {
    setName(draft)
    push('Nombre guardado', 'success')
  }

  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted mb-3">
        Tu nombre
      </h3>
      <p className="text-sm text-muted mb-3">
        Aparecerá en el saludo del dashboard. Se guarda localmente en este
        dispositivo.
      </p>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ej. Adrián"
          maxLength={40}
        />
        <Button
          onClick={save}
          disabled={!dirty}
          variant="primary"
          icon={<Check className="h-4 w-4" />}
        >
          Guardar
        </Button>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------- */
/* Sección CATEGORÍAS                                                   */
/* -------------------------------------------------------------------- */
function CategoriesSection() {
  const { categories, add, update, remove, reset } = useCategories()
  const { push } = useToast()
  const [editing, setEditing] = useState<Category | null>(null)
  const [creating, setCreating] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      // Reasignar items que la usaban a 'general' antes de borrar la categoría
      const [subsRes, finsRes] = await Promise.all([
        supabase.from('subscriptions').update({ category: 'general' }).eq('category', pendingDelete.id),
        supabase.from('financings').update({ category: 'general' }).eq('category', pendingDelete.id),
      ])
      if (subsRes.error) throw subsRes.error
      if (finsRes.error) throw finsRes.error

      remove(pendingDelete.id)
      push(`Categoría "${pendingDelete.label}" eliminada`, 'success')
      setPendingDelete(null)
    } catch (err) {
      push(`Error al eliminar: ${(err as Error).message}`, 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Categorías
        </h3>
        <button
          type="button"
          onClick={() => {
            reset()
            push('Categorías restauradas', 'success')
          }}
          className="text-[11px] text-muted hover:text-ink transition-colors flex items-center gap-1"
          title="Restaurar las categorías predefinidas"
        >
          <RotateCcw className="h-3 w-3" />
          Restaurar
        </button>
      </div>
      <p className="text-sm text-muted mb-4">
        Organiza tus suscripciones y financiaciones por categoría.
      </p>

      <ul className="space-y-1.5 mb-4">
        {categories.map((cat) => (
          <li
            key={cat.id}
            className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[var(--bg)] border border-subtle"
          >
            <span
              className="h-8 w-8 rounded-lg flex items-center justify-center text-lg shrink-0"
              style={{ background: `${cat.color}22`, color: cat.color }}
            >
              {cat.emoji}
            </span>

            <span className="flex-1 text-sm font-medium text-ink truncate">
              {cat.label}
              {cat.builtin && cat.id !== 'general' && (
                <span className="ml-2 text-[10px] text-muted font-normal">predefinida</span>
              )}
              {cat.id === 'general' && (
                <span className="ml-2 text-[10px] text-muted font-normal">por defecto</span>
              )}
            </span>

            {cat.id !== 'general' && (
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditing(cat)}
                  className="p-2 rounded-md hover:bg-[var(--border)]/50 text-muted hover:text-ink transition-colors"
                  aria-label={`Editar ${cat.label}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDelete(cat)}
                  className="p-2 rounded-md hover:bg-alert/15 text-muted hover:text-alert transition-colors"
                  aria-label={`Eliminar ${cat.label}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <Button
        variant="secondary"
        onClick={() => setCreating(true)}
        icon={<Plus className="h-4 w-4" />}
        className="w-full"
      >
        Crear categoría
      </Button>

      {/* Editor */}
      {(creating || editing) && (
        <CategoryEditor
          existing={editing}
          onClose={() => {
            setEditing(null)
            setCreating(false)
          }}
          onSubmit={(input) => {
            try {
              if (editing) {
                update(editing.id, input)
                push('Categoría actualizada', 'success')
              } else {
                add(input)
                push('Categoría creada', 'success')
              }
              setEditing(null)
              setCreating(false)
            } catch (err) {
              push((err as Error).message, 'error')
            }
          }}
        />
      )}

      {/* Confirmación de borrado en modal centrado */}
      {pendingDelete && (
        <ConfirmDeleteModal
          category={pendingDelete}
          deleting={deleting}
          onCancel={() => setPendingDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </section>
  )
}

/* -------------------------------------------------------------------- */
/* Sub-modal: editor de una categoría                                   */
/* -------------------------------------------------------------------- */
interface EditorProps {
  existing: Category | null
  onClose: () => void
  onSubmit: (input: { label: string; emoji: string; color: string; id?: string }) => void
}

function CategoryEditor({ existing, onClose, onSubmit }: EditorProps) {
  const [label, setLabel] = useState(existing?.label ?? '')
  const [emoji, setEmoji] = useState(existing?.emoji ?? '✨')
  const [color, setColor] = useState(existing?.color ?? '#9CA3AF')
  const [error, setError] = useState('')

  const submit = () => {
    if (!label.trim()) {
      setError('Pon un nombre')
      return
    }
    const id = existing?.id ?? slugify(label)
    if (!id) {
      setError('El nombre no es válido')
      return
    }
    onSubmit({ id: existing?.id, label, emoji, color })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={existing ? 'Editar categoría' : 'Nueva categoría'}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit}>{existing ? 'Guardar' : 'Crear'}</Button>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        <div className="flex gap-4 items-start">
          <div className="pt-5">
            <button
              type="button"
              onClick={() => {
                const next = prompt('Pega un emoji', emoji)
                if (next) setEmoji(next.trim().slice(0, 4))
              }}
              className="h-14 w-14 rounded-2xl border border-subtle flex items-center justify-center text-3xl leading-none transition hover:border-[var(--ink)]/30"
              style={{ background: `${color}22` }}
              aria-label="Cambiar emoji"
            >
              {emoji}
            </button>
          </div>
          <div className="flex-1">
            <Field label="Nombre" required error={error}>
              <Input
                value={label}
                onChange={(e) => { setLabel(e.target.value); setError('') }}
                placeholder="Música, Trabajo, Streaming…"
                autoFocus
                maxLength={32}
              />
            </Field>
          </div>
        </div>

        <Field label="Color">
          <div className="grid grid-cols-8 gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-9 w-9 rounded-lg transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-offset-[var(--card)] ring-[var(--ink)]' : ''}`}
                style={{ background: c }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </Field>
      </div>
    </Modal>
  )
}
/* -------------------------------------------------------------------- */
/* Sub-modal: confirmación de borrado de una categoría                  */
/* -------------------------------------------------------------------- */
interface ConfirmDeleteProps {
  category: Category
  deleting: boolean
  onCancel: () => void
  onConfirm: () => void
}

function ConfirmDeleteModal({ category, deleting, onCancel, onConfirm }: ConfirmDeleteProps) {
  return (
    <Modal
      open
      onClose={onCancel}
      title="Eliminar categoría"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={deleting}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Eliminando…' : 'Eliminar'}
          </Button>
        </div>
      }
    >
      <div className="py-2 space-y-3">
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-subtle"
          style={{ background: `${category.color}10` }}
        >
          <span
            className="h-9 w-9 rounded-lg flex items-center justify-center text-lg shrink-0"
            style={{ background: `${category.color}22`, color: category.color }}
          >
            {category.emoji}
          </span>
          <span className="text-sm font-medium text-ink">{category.label}</span>
        </div>
        <p className="text-sm text-muted leading-relaxed">
          Las suscripciones y financiaciones que usaban esta categoría pasarán
          automáticamente a <span className="text-ink font-medium">General</span>.
        </p>
        <p className="text-xs text-muted">Esta acción no se puede deshacer.</p>
      </div>
    </Modal>
  )
}
