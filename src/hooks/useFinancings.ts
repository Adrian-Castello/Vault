import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Financing, FinancingInput } from '../lib/types'
import { useToast } from './useToast'

interface State {
  data: Financing[]
  loading: boolean
  error: string | null
}

export function useFinancings() {
  const [state, setState] = useState<State>({
    data: [],
    loading: true,
    error: null,
  })
  const { push } = useToast()

  const refetch = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))
    const { data, error } = await supabase
      .from('financings')
      .select('*')
      .order('next_charge_date', { ascending: true })

    if (error) {
      setState({ data: [], loading: false, error: error.message })
      push(`No se pudieron cargar las financiaciones: ${error.message}`, 'error')
      return
    }
    setState({ data: (data ?? []) as Financing[], loading: false, error: null })
  }, [push])

  useEffect(() => {
    refetch()
  }, [refetch])

  const create = useCallback(
    async (input: FinancingInput) => {
      const { data, error } = await supabase
        .from('financings')
        .insert(input)
        .select()
        .single()
      if (error) {
        push(`Error al crear: ${error.message}`, 'error')
        throw error
      }
      setState((s) => ({
        ...s,
        data: [...s.data, data as Financing].sort((a, b) =>
          a.next_charge_date.localeCompare(b.next_charge_date),
        ),
      }))
      push('Financiación creada', 'success')
      return data as Financing
    },
    [push],
  )

  const update = useCallback(
    async (id: string, input: FinancingInput) => {
      const { data, error } = await supabase
        .from('financings')
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
          .map((x) => (x.id === id ? (data as Financing) : x))
          .sort((a, b) => a.next_charge_date.localeCompare(b.next_charge_date)),
      }))
      push('Financiación actualizada', 'success')
      return data as Financing
    },
    [push],
  )

  const remove = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('financings').delete().eq('id', id)
      if (error) {
        push(`Error al eliminar: ${error.message}`, 'error')
        throw error
      }
      setState((s) => ({ ...s, data: s.data.filter((x) => x.id !== id) }))
      push('Financiación eliminada', 'success')
    },
    [push],
  )

  return { ...state, refetch, create, update, remove }
}
