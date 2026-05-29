import { useEffect, useRef } from 'react'

/**
 * Detecta cambios sin guardar comparando un valor `current` con un `initial`
 * que se "resetea" cuando se abre el formulario (open=true).
 *
 * Devuelve una función `confirmClose(onClose)` para llamarla en el onClose del modal:
 * si hay cambios, pide confirmación al usuario; si no, cierra directo.
 */
export function useUnsavedChanges<T>(
  open: boolean,
  current: T,
  isEqual: (a: T, b: T) => boolean = defaultIsEqual,
) {
  const initialRef = useRef<T>(current)

  // Cada vez que se abre el modal, fijamos el estado inicial
  useEffect(() => {
    if (open) {
      initialRef.current = current
    }
    // Solo queremos reaccionar al cambio de `open`, no de `current`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const isDirty = !isEqual(current, initialRef.current)

  const confirmClose = (close: () => void) => {
    if (!isDirty) return close()
    const ok = window.confirm(
      '¿Cerrar sin guardar? Los cambios se perderán.',
    )
    if (ok) close()
  }

  return { isDirty, confirmClose }
}

function defaultIsEqual<T>(a: T, b: T): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
