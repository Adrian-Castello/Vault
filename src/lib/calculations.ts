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

/** Cost of a subscription normalised to a monthly figure. */
export function monthlyCostOfSubscription(sub: Subscription): number {
  switch (sub.billing_cycle) {
    case 'monthly':
      return sub.price
    case 'quarterly':
      return sub.price / 3
    case 'yearly':
      return sub.price / 12
  }
}

export function totalMonthlySubscriptions(subs: Subscription[]): number {
  return subs.reduce((acc, s) => acc + monthlyCostOfSubscription(s), 0)
}

/** Active financings = those with paid < total. */
export function activeFinancings(fins: Financing[]): Financing[] {
  return fins.filter((f) => f.paid_installments < f.total_installments)
}

export function totalMonthlyFinancings(fins: Financing[]): number {
  return activeFinancings(fins).reduce((acc, f) => acc + f.monthly_payment, 0)
}

export function totalRemainingDebt(fins: Financing[]): number {
  return fins.reduce(
    (acc, f) =>
      acc +
      Math.max(0, f.total_installments - f.paid_installments) * f.monthly_payment,
    0,
  )
}

export function totalAnnualProjection(
  subs: Subscription[],
  fins: Financing[],
): number {
  // Annualised monthly base
  const baseMonthly = totalMonthlySubscriptions(subs) + totalMonthlyFinancings(fins)
  // Note: financings will taper off as they finish, so this is a high-water
  // estimate. The 12-month projection (chart) shows the real curve.
  return baseMonthly * 12
}

/**
 * Charges due in the next `days` days (inclusive of today, exclusive of day+days).
 */
export function upcomingCharges(
  subs: Subscription[],
  fins: Financing[],
  days = 7,
): UpcomingCharge[] {
  const today = startOfToday()
  const items: UpcomingCharge[] = []

  for (const s of subs) {
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

/**
 * Single nearest upcoming charge (across both kinds). Includes today.
 */
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
 * For each of the next `months` months (starting at this month), compute the
 * total subscription cost (charges falling in that month) and financing cost
 * (monthly payment as long as there are installments remaining).
 *
 * Subscriptions:
 *  - monthly: contribute price every month from their next_charge_date onward.
 *  - quarterly: contribute price every 3 months from next_charge_date.
 *  - yearly: contribute price every 12 months from next_charge_date.
 *
 * Financings:
 *  - contribute monthly_payment for the remaining installments only.
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

  // Subscriptions
  for (const s of subs) {
    const start = parseISODate(s.next_charge_date)
    const startMonth = startOfMonth(start)
    const step =
      s.billing_cycle === 'monthly' ? 1 : s.billing_cycle === 'quarterly' ? 3 : 12

    // Iterate forward charge dates; stop when past our window
    let cursor = startMonth
    let safety = 0
    while (safety < months * 12) {
      const idx = buckets.findIndex((b) => {
        const bd = parseISODate(b.month)
        return isSameMonth(bd, cursor)
      })
      if (idx === -1) {
        // Either before window or past it. If past, we're done.
        const lastMonth = parseISODate(buckets[buckets.length - 1].month)
        if (cursor > lastMonth) break
      } else {
        buckets[idx].subsTotal += s.price
      }
      cursor = addMonths(cursor, step)
      safety++
    }
  }

  // Financings: monthly payment, only for remaining installments.
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

/** Pretty-print a euro amount. */
export function formatEuro(value: number, opts: { decimals?: number } = {}): string {
  const decimals = opts.decimals ?? 2
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/** Pretty-print without decimals when whole, otherwise 2. */
export function formatEuroSmart(value: number): string {
  const isWhole = Math.abs(value - Math.round(value)) < 0.005
  return formatEuro(value, { decimals: isWhole ? 0 : 2 })
}
