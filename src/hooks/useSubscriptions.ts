import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Subscription, SubscriptionInput } from '../lib/types'
import { useToast } from './useToast'

interface State {
  data: Subscription[]
  loading: boolean
  error: string | null
}

export function useSubscriptions() {
  const [state, setState] = useState<State>({
    data: [],
    loading: true,
    error: null,
  })
  const { push } = useToast()

  const refetch = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('next_charge_date', { ascending: true })

    if (error) {
      setState({ data: [], loading: false, error: error.message })
      push(`No se pudieron cargar las suscripciones: ${error.message}`, 'error')
      return
    }
    setState({ data: (data ?? []) as Subscription[], loading: false, error: null })
  }, [push])

  useEffect(() => {
    refetch()
  }, [refetch])

  const create = useCallback(
    async (input: SubscriptionInput) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert(input)
        .select()
        .single()
      if (error) {
        push(`Error al crear: ${error.message}`, 'error')
        throw error
      }
      setState((s) => ({
        ...s,
        data: [...s.data, data as Subscription].sort((a, b) =>
          a.next_charge_date.localeCompare(b.next_charge_date),
        ),
      }))
      push('Suscripción creada', 'success')
      return data as Subscription
    },
    [push],
  )

  const update = useCallback(
    async (id: string, input: SubscriptionInput) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .update(input)
        .eq('id', id)
        .select()
        .single()
      if (error) {
        push(`Error al actualizar: ${error.message}`, 'error')
        throw error
      }
      setState((s) => ({
        ...s,
        data: s.data
          .map((x) => (x.id === id ? (data as Subscription) : x))
          .sort((a, b) => a.next_charge_date.localeCompare(b.next_charge_date)),
      }))
      push('Suscripción actualizada', 'success')
      return data as Subscription
    },
    [push],
  )

  const remove = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('subscriptions').delete().eq('id', id)
      if (error) {
        push(`Error al eliminar: ${error.message}`, 'error')
        throw error
      }
      setState((s) => ({ ...s, data: s.data.filter((x) => x.id !== id) }))
      push('Suscripción eliminada', 'success')
    },
    [push],
  )

  /** Marca como 'cancelled' sin borrarla. */
  const cancel = useCallback(
    async (id: string) => {
      const patch = { status: 'cancelled' as const, cancelled_at: new Date().toISOString() }
      const { data, error } = await supabase
        .from('subscriptions')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
      if (error) {
        push(`Error al cancelar: ${error.message}`, 'error')
        throw error
      }
      setState((s) => ({
        ...s,
        data: s.data
          .map((x) => (x.id === id ? (data as Subscription) : x))
          .sort((a, b) => a.next_charge_date.localeCompare(b.next_charge_date)),
      }))
      push('Suscripción cancelada', 'success')
      return data as Subscription
    },
    [push],
  )

  /** Vuelve a estado 'active'. */
  const reactivate = useCallback(
    async (id: string) => {
      const patch = { status: 'active' as const, cancelled_at: null }
      const { data, error } = await supabase
        .from('subscriptions')
        .update(patch)
        .eq('id', id)
        .select()
        .single()
      if (error) {
        push(`Error al reactivar: ${error.message}`, 'error')
        throw error
      }
      setState((s) => ({
        ...s,
        data: s.data
          .map((x) => (x.id === id ? (data as Subscription) : x))
          .sort((a, b) => a.next_charge_date.localeCompare(b.next_charge_date)),
      }))
      push('Suscripción reactivada', 'success')
      return data as Subscription
    },
    [push],
  )

  return { ...state, refetch, create, update, remove, cancel, reactivate }
}
