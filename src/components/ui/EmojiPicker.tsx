import { useEffect, useRef, useState } from 'react'
import EmojiPickerReact, { Theme, EmojiStyle } from 'emoji-picker-react'
import { useTheme } from '../../hooks/useTheme'

interface EmojiPickerProps {
  value: string
  onChange: (emoji: string) => void
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  const [open, setOpen] = useState(false)
  const { theme } = useTheme()
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="h-14 w-14 rounded-2xl bg-[var(--bg)] dark:bg-[var(--card)] border border-subtle flex items-center justify-center text-3xl leading-none transition hover:border-[var(--ink)]/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]/20"
        aria-label="Elegir emoji"
      >
        {value || '✨'}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-30 shadow-xl rounded-2xl overflow-hidden border border-subtle">
          <EmojiPickerReact
            theme={theme === 'dark' ? Theme.DARK : Theme.LIGHT}
            emojiStyle={EmojiStyle.NATIVE}
            lazyLoadEmojis
            skinTonesDisabled
            searchPlaceholder="Buscar emoji…"
            width={320}
            height={380}
            onEmojiClick={(emoji) => {
              onChange(emoji.emoji)
              setOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}
