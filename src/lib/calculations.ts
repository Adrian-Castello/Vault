import type {
  Financing,
  MonthlyProjection,
  Subscription,
  UpcomingCharge,
} from './types'
import {
  addMonths,
  daysBetween,
  formatMonthShort,
  isSameMonth,
  parseISODate,
  startOfMonth,
  startOfToday,
  toISODate,
} from './dates'

// =====================================================================
// HELPERS DE ESTADO
// =====================================================================

/**
 * Una suscripción "cuenta" para coste mensual, calendario y proyecciones
 * solo cuando su status es 'active'. Trial/paused/cancelled se ignoran.
 */
export function subscriptionCounts(sub: Subscription): boolean {
  return sub.status === 'active'
}

export function activeSubscriptions(subs: Subscription[]): Subscription[] {
  return subs.filter(subscriptionCounts)
}

export function subscriptionsByStatus(subs: Subscription[]) {
  return {
    active:    subs.filter((s) => s.status === 'active'),
    trial:     subs.filter((s) => s.status === 'trial'),
    paused:    subs.filter((s) => s.status === 'paused'),
    cancelled: subs.filter((s) => s.status === 'cancelled'),
  }
}

// =====================================================================
// COSTE
// =====================================================================

/** Coste de una suscripción normalizado a un valor mensual equivalente. */
export function monthlyCostOfSubscription(sub: Subscription): number {
  switch (sub.billing_cycle) {
    case 'monthly':    return sub.price
    case 'quarterly':  return sub.price / 3
    case 'semiannual': return sub.price / 6
    case 'yearly':     return sub.price / 12
  }
}

/** Coste mensual total de las suscripciones ACTIVAS. */
export function totalMonthlySubscriptions(subs: Subscription[]): number {
  return activeSubscriptions(subs).reduce((acc, s) => acc + monthlyCostOfSubscription(s), 0)
}

/** Cuántos meses tiene cada ciclo. */
export function monthsPerCycle(cycle: Subscription['billing_cycle']): number {
  switch (cycle) {
    case 'monthly':    return 1
    case 'quarterly':  return 3
    case 'semiannual': return 6
    case 'yearly':     return 12
  }
}

// =====================================================================
// FINANCIACIONES
// =====================================================================

/** Financiaciones activas = aún les quedan cuotas por pagar. */
export function activeFinancings(fins: Financing[]): Financing[] {
  return fins.filter((f) => f.paid_installments < f.total_installments)
}

export function totalMonthlyFinancings(fins: Financing[]): number {
  return activeFinancings(fins).reduce((acc, f) => acc + f.monthly_payment, 0)
}

export function totalRemainingDebt(fins: Financing[]): number {
  return fins.reduce(
    (acc, f) =>
      acc + Math.max(0, f.total_installments - f.paid_installments) * f.monthly_payment,
    0,
  )
}

/** Importe total que ya se ha pagado en todas las financiaciones. */
export function totalPaidAmount(fins: Financing[]): number {
  return fins.reduce((acc, f) => acc + f.paid_installments * f.monthly_payment, 0)
}

/** Importe total comprometido (suma de total_amount). */
export function totalCommittedAmount(fins: Financing[]): number {
  return fins.reduce((acc, f) => acc + f.total_amount, 0)
}

/**
 * Porcentaje global de amortización (0–100).
 * Se calcula sobre cuotas (no sobre importes), para que financiaciones con cuotas
 * iguales tengan el mismo peso en el progreso global.
 */
export function globalProgressPercent(fins: Financing[]): number {
  let paid = 0
  let total = 0
  for (const f of fins) {
    paid += f.paid_installments
    total += f.total_installments
  }
  if (total === 0) return 0
  return Math.min(100, (paid / total) * 100)
}

/**
 * Fecha en que termina la última cuota de la última financiación activa.
 * Devuelve null si no hay financiaciones activas.
 */
export function debtFreeDate(fins: Financing[]): string | null {
  const actives = activeFinancings(fins)
  if (actives.length === 0) return null
  let latest: string | null = null
  for (const f of actives) {
    if (!latest || f.end_date > latest) latest = f.end_date
  }
  return latest
}

// =====================================================================
// PROYECCIÓN / CALENDARIO
// =====================================================================

export function totalAnnualProjection(
  subs: Subscription[],
  fins: Financing[],
): number {
  const baseMonthly = totalMonthlySubscriptions(subs) + totalMonthlyFinancings(fins)
  return baseMonthly * 12
}

/**
 * Cargos en los próximos `days` días (incluyendo hoy, excluyendo hoy+days).
 * Solo cuenta suscripciones ACTIVAS y financiaciones con cuotas pendientes.
 */
export function upcomingCharges(
  subs: Subscription[],
  fins: Financing[],
  days = 7,
): UpcomingCharge[] {
  const today = startOfToday()
  const items: UpcomingCharge[] = []

  for (const s of subs) {
    if (!subscriptionCounts(s)) continue
    const d = parseISODate(s.next_charge_date)
    const diff = daysBetween(today, d)
    if (diff >= 0 && diff < days) {
      items.push({
        id: s.id,
        kind: 'subscription',
        name: s.name,
        emoji: s.emoji,
        amount: s.price,
        date: s.next_charge_date,
        daysAway: diff,
      })
    }
  }

  for (const f of fins) {
    if (f.paid_installments >= f.total_installments) continue
    const d = parseISODate(f.next_charge_date)
    const diff = daysBetween(today, d)
    if (diff >= 0 && diff < days) {
      items.push({
        id: f.id,
        kind: 'financing',
        name: f.name,
        emoji: f.emoji,
        amount: f.monthly_payment,
        date: f.next_charge_date,
        daysAway: diff,
      })
    }
  }

  return items.sort((a, b) => a.daysAway - b.daysAway)
}

export function nextCharge(
  subs: Subscription[],
  fins: Financing[],
): UpcomingCharge | null {
  const today = startOfToday()
  let best: UpcomingCharge | null = null

  const consider = (c: UpcomingCharge) => {
    if (c.daysAway < 0) return
    if (!best || c.daysAway < best.daysAway) best = c
  }

  for (const s of subs) {
    if (!subscriptionCounts(s)) continue
    const d = parseISODate(s.next_charge_date)
    const diff = daysBetween(today, d)
    consider({
      id: s.id,
      kind: 'subscription',
      name: s.name,
      emoji: s.emoji,
      amount: s.price,
      date: s.next_charge_date,
      daysAway: diff,
    })
  }
  for (const f of fins) {
    if (f.paid_installments >= f.total_installments) continue
    const d = parseISODate(f.next_charge_date)
    const diff = daysBetween(today, d)
    consider({
      id: f.id,
      kind: 'financing',
      name: f.name,
      emoji: f.emoji,
      amount: f.monthly_payment,
      date: f.next_charge_date,
      daysAway: diff,
    })
  }
  return best
}

/**
 * Para cada uno de los próximos `months` meses (empezando este mes), calcula
 * el coste de suscripciones (cargos que caen en ese mes) y financiaciones
 * (cuota mensual mientras queden cuotas).
 */
export function projectMonthlySpend(
  subs: Subscription[],
  fins: Financing[],
  months = 12,
): MonthlyProjection[] {
  const today = startOfToday()
  const firstMonth = startOfMonth(today)

  const buckets: MonthlyProjection[] = []
  for (let i = 0; i < months; i++) {
    const m = addMonths(firstMonth, i)
    buckets.push({
      month: toISODate(m),
      label: formatMonthShort(m),
      subsTotal: 0,
      finsTotal: 0,
      total: 0,
    })
  }

  // Suscripciones (solo activas)
  for (const s of subs) {
    if (!subscriptionCounts(s)) continue
    const start = parseISODate(s.next_charge_date)
    const startMonth = startOfMonth(start)
    const step = monthsPerCycle(s.billing_cycle)

    let cursor = startMonth
    let safety = 0
    while (safety < months * 12) {
      const idx = buckets.findIndex((b) => isSameMonth(parseISODate(b.month), cursor))
      if (idx === -1) {
        const lastMonth = parseISODate(buckets[buckets.length - 1].month)
        if (cursor > lastMonth) break
      } else {
        buckets[idx].subsTotal += s.price
      }
      cursor = addMonths(cursor, step)
      safety++
    }
  }

  // Financiaciones
  for (const f of fins) {
    const remaining = f.total_installments - f.paid_installments
    if (remaining <= 0) continue
    const start = parseISODate(f.next_charge_date)
    const startMonth = startOfMonth(start)
    for (let i = 0; i < remaining; i++) {
      const m = addMonths(startMonth, i)
      const idx = buckets.findIndex((b) => isSameMonth(parseISODate(b.month), m))
      if (idx !== -1) {
        buckets[idx].finsTotal += f.monthly_payment
      }
    }
  }

  for (const b of buckets) {
    b.total = b.subsTotal + b.finsTotal
  }
  return buckets
}

// =====================================================================
// AGRUPACIONES POR CATEGORÍA
// =====================================================================

/**
 * Coste mensual equivalente agrupado por categoría, solo de suscripciones ACTIVAS.
 * Devuelve un map { categoryId: monto }.
 */
export function monthlySubsByCategory(subs: Subscription[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const s of activeSubscriptions(subs)) {
    const cat = s.category || 'general'
    out[cat] = (out[cat] ?? 0) + monthlyCostOfSubscription(s)
  }
  return out
}

/**
 * Cuota mensual de financiaciones ACTIVAS agrupada por categoría.
 */
export function monthlyFinsByCategory(fins: Financing[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const f of activeFinancings(fins)) {
    const cat = f.category || 'general'
    out[cat] = (out[cat] ?? 0) + f.monthly_payment
  }
  return out
}

// =====================================================================
// FORMATEADO
// =====================================================================

export function formatEuro(value: number, opts: { decimals?: number } = {}): string {
  const decimals = opts.decimals ?? 2
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatEuroSmart(value: number): string {
  const isWhole = Math.abs(value - Math.round(value)) < 0.005
  return formatEuro(value, { decimals: isWhole ? 0 : 2 })
}
