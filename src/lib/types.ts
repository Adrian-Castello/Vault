export type BillingCycle = 'monthly' | 'quarterly' | 'yearly'

export interface Subscription {
  id: string
  name: string
  emoji: string
  price: number
  billing_cycle: BillingCycle
  next_charge_date: string // ISO date (YYYY-MM-DD)
  created_at?: string
}

export interface Financing {
  id: string
  name: string
  emoji: string
  total_amount: number
  monthly_payment: number
  total_installments: number
  paid_installments: number
  next_charge_date: string // ISO date (YYYY-MM-DD)
  end_date: string // ISO date (YYYY-MM-DD)
  created_at?: string
}

export type SubscriptionInput = Omit<Subscription, 'id' | 'created_at'>
export type FinancingInput = Omit<Financing, 'id' | 'created_at'>

export interface UpcomingCharge {
  id: string
  kind: 'subscription' | 'financing'
  name: string
  emoji: string
  amount: number
  date: string // ISO date
  daysAway: number
}

export interface MonthlyProjection {
  month: string // ISO date, first of month
  label: string // e.g. "Jun"
  subsTotal: number
  finsTotal: number
  total: number
}
