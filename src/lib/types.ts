// Ciclos de facturación
export type BillingCycle = 'monthly' | 'quarterly' | 'semiannual' | 'yearly'

// Estados de una suscripción
export type SubscriptionStatus = 'active' | 'trial' | 'paused' | 'cancelled'

export interface Subscription {
  id: string
  name: string
  emoji: string
  price: number
  billing_cycle: BillingCycle
  next_charge_date: string // ISO date (YYYY-MM-DD)
  category: string         // id de la categoría
  status: SubscriptionStatus
  trial_end_date?: string | null   // solo cuando status='trial'
  cancelled_at?: string | null     // timestamptz cuando se canceló
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
  category: string // id de la categoría
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

// =====================================================================
// CATEGORÍAS
// =====================================================================
// Las categorías viven en localStorage (clave 'vault:categories').
// Vienen unas predefinidas y el usuario puede crear/editar/borrar las suyas.
// =====================================================================

export interface Category {
  id: string       // slug único, sin espacios, en minúsculas (ej: 'musica')
  label: string    // nombre visible (ej: 'Música')
  emoji: string    // emoji representativo (ej: '🎵')
  color: string    // color hex de acento (ej: '#A78BFA')
  builtin?: boolean // true si es una de las predefinidas (no se puede borrar)
}

// Categoría "general" — siempre existe, no se puede borrar ni renombrar.
// Es la categoría por defecto para items sin categoría asignada.
export const FALLBACK_CATEGORY: Category = {
  id: 'general',
  label: 'General',
  emoji: '✨',
  color: '#9CA3AF',
  builtin: true,
}
