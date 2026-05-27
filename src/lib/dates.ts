// All app dates are stored as "YYYY-MM-DD" strings.
// We deliberately do NOT use `new Date('YYYY-MM-DD')` directly because that
// parses as UTC, which can shift the day in non-UTC timezones. Instead we
// build a local Date with explicit components.

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function startOfToday(): Date {
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  return t
}

export function daysBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24))
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const targetMonth = d.getMonth() + months
  d.setMonth(targetMonth)
  // Handle "Jan 31 + 1 month" → Feb 28/29 (avoid jumping to March)
  if (d.getMonth() !== ((targetMonth % 12) + 12) % 12) {
    d.setDate(0)
  }
  return d
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

const MONTHS_ES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
]

export function formatMonthShort(date: Date): string {
  return MONTHS_ES[date.getMonth()]
}

export function formatMonthLong(date: Date): string {
  const long = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ]
  return `${long[date.getMonth()]} ${date.getFullYear()}`
}

/**
 * Human-friendly date: "Hoy", "Mañana", "En 3 días", "el 12 jun".
 */
export function formatRelativeDate(iso: string): string {
  const target = parseISODate(iso)
  const today = startOfToday()
  const diff = daysBetween(today, target)
  if (diff === 0) return 'Hoy'
  if (diff === 1) return 'Mañana'
  if (diff > 1 && diff < 7) return `En ${diff} días`
  if (diff === -1) return 'Ayer'
  if (diff < 0) return `Hace ${Math.abs(diff)} días`
  const day = target.getDate()
  return `${day} ${MONTHS_ES[target.getMonth()]}`
}

export function formatFullDate(iso: string): string {
  const d = parseISODate(iso)
  return `${d.getDate()} ${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`
}
