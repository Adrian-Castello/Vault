import { useCallback, useEffect, useState } from 'react'
import type { Category } from './types'
import { FALLBACK_CATEGORY } from './types'

const STORAGE_KEY = 'vault:categories'

// Categorías predefinidas que vienen "de fábrica" pero el usuario puede editarlas.
// Si las borra, vuelven a aparecer en futuras instalaciones (limpieza del localStorage).
const DEFAULT_CATEGORIES: Category[] = [
  FALLBACK_CATEGORY,
  { id: 'streaming',     label: 'Streaming',     emoji: '📺', color: '#EF4444', builtin: true },
  { id: 'musica',        label: 'Música',        emoji: '🎵', color: '#A78BFA', builtin: true },
  { id: 'software',      label: 'Software',      emoji: '💻', color: '#60A5FA', builtin: true },
  { id: 'gaming',        label: 'Gaming',        emoji: '🎮', color: '#34D399', builtin: true },
  { id: 'entretenimiento', label: 'Entretenimiento', emoji: '🎬', color: '#F59E0B', builtin: true },
  { id: 'trabajo',       label: 'Trabajo',       emoji: '💼', color: '#94A3B8', builtin: true },
  { id: 'productividad', label: 'Productividad', emoji: '⚡', color: '#FBBF24', builtin: true },
  { id: 'noticias',      label: 'Noticias',      emoji: '📰', color: '#6B7280', builtin: true },
  { id: 'fitness',       label: 'Fitness',       emoji: '💪', color: '#10B981', builtin: true },
  { id: 'comida',        label: 'Comida',        emoji: '🍔', color: '#F97316', builtin: true },
  { id: 'transporte',    label: 'Transporte',    emoji: '🚗', color: '#0EA5E9', builtin: true },
  { id: 'hogar',         label: 'Hogar',         emoji: '🏠', color: '#8B5CF6', builtin: true },
  { id: 'tecnologia',    label: 'Tecnología',    emoji: '📱', color: '#06B6D4', builtin: true },
  { id: 'salud',         label: 'Salud',         emoji: '🩺', color: '#EC4899', builtin: true },
  // Categorías más típicas de financiaciones
  { id: 'vehiculo',      label: 'Vehículo',      emoji: '🚙', color: '#0284C7', builtin: true },
  { id: 'electrodomesticos', label: 'Electrodomésticos', emoji: '🧊', color: '#7C3AED', builtin: true },
  { id: 'muebles',       label: 'Muebles',       emoji: '🛋️', color: '#D97706', builtin: true },
  { id: 'reformas',      label: 'Reformas',      emoji: '🔨', color: '#B45309', builtin: true },
]

function readFromStorage(): Category[] {
  if (typeof window === 'undefined') return DEFAULT_CATEGORIES
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_CATEGORIES
    const parsed = JSON.parse(raw) as Category[]
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_CATEGORIES
    // Asegurar que 'general' siempre exista
    if (!parsed.find((c) => c.id === FALLBACK_CATEGORY.id)) {
      parsed.unshift(FALLBACK_CATEGORY)
    }
    return parsed
  } catch {
    return DEFAULT_CATEGORIES
  }
}

function writeToStorage(cats: Category[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cats))
    // Avisa a otras instancias del hook (otras pestañas, otros componentes)
    window.dispatchEvent(new CustomEvent('vault:categories-changed'))
  } catch {
    // ignore
  }
}

/** Convierte un texto a un slug usable como id. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quitar tildes
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Encuentra una categoría por id; si no existe, devuelve la de fallback. */
export function findCategory(cats: Category[], id: string): Category {
  return cats.find((c) => c.id === id) ?? FALLBACK_CATEGORY
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(readFromStorage)

  // Sincronizar entre componentes y pestañas
  useEffect(() => {
    const sync = () => setCategories(readFromStorage())
    window.addEventListener('vault:categories-changed', sync)
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) sync()
    })
    return () => {
      window.removeEventListener('vault:categories-changed', sync)
    }
  }, [])

  const add = useCallback((cat: Omit<Category, 'id' | 'builtin'> & { id?: string }) => {
    const id = cat.id ?? slugify(cat.label)
    if (!id) throw new Error('Nombre inválido')
    const current = readFromStorage()
    if (current.find((c) => c.id === id)) {
      throw new Error('Ya existe una categoría con ese nombre')
    }
    const next: Category = {
      id,
      label: cat.label.trim(),
      emoji: cat.emoji || '✨',
      color: cat.color || '#9CA3AF',
      builtin: false,
    }
    const updated = [...current, next]
    writeToStorage(updated)
    setCategories(updated)
    return next
  }, [])

  const update = useCallback((id: string, patch: Partial<Omit<Category, 'id' | 'builtin'>>) => {
    if (id === FALLBACK_CATEGORY.id) {
      throw new Error('La categoría "General" no se puede editar')
    }
    const current = readFromStorage()
    const updated = current.map((c) =>
      c.id === id ? { ...c, ...patch, label: (patch.label ?? c.label).trim() } : c,
    )
    writeToStorage(updated)
    setCategories(updated)
  }, [])

  const remove = useCallback((id: string) => {
    if (id === FALLBACK_CATEGORY.id) {
      throw new Error('La categoría "General" no se puede borrar')
    }
    const current = readFromStorage()
    const updated = current.filter((c) => c.id !== id)
    writeToStorage(updated)
    setCategories(updated)
  }, [])

  const reset = useCallback(() => {
    writeToStorage(DEFAULT_CATEGORIES)
    setCategories(DEFAULT_CATEGORIES)
  }, [])

  return { categories, add, update, remove, reset }
}
