interface EmojiPickerProps {
  value: string
  onChange: (emoji: string) => void
}

/**
 * Selector de emoji minimalista: un cuadro grande con el emoji actual.
 * Al pulsar, se abre un prompt nativo donde el usuario escribe/pega el emoji.
 * Sin librería de búsqueda, sin paneles, sin teclado virtual.
 */
export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const handleClick = () => {
    const next = prompt('Escribe o pega un emoji', value || '✨')
    if (next === null) return // cancelado
    const trimmed = next.trim()
    if (trimmed) {
      // Coger solo el primer "carácter visual" (un emoji puede ocupar 1-4 code units)
      // Pero como un emoji compuesto puede ser largo, dejamos un margen.
      onChange(trimmed.slice(0, 8))
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Cambiar emoji"
      className="h-14 w-14 rounded-2xl border border-subtle bg-[var(--bg)] dark:bg-[var(--card)] flex items-center justify-center text-3xl leading-none transition hover:border-[var(--ink)]/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]/20"
    >
      {value || '✨'}
    </button>
  )
}
