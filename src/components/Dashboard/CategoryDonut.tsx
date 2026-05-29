import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import type { Financing, Subscription } from '../../lib/types'
import {
  formatEuroSmart,
  monthlyFinsByCategory,
  monthlySubsByCategory,
} from '../../lib/calculations'
import { findCategory, useCategories } from '../../lib/categories'

interface Props {
  subscriptions: Subscription[]
  financings: Financing[]
}

type Mode = 'both' | 'subs' | 'fins'

interface Slice {
  categoryId: string
  label: string
  emoji: string
  color: string
  amount: number
  pct: number
  startAngle: number
  endAngle: number
}

export function CategoryDonut({ subscriptions, financings }: Props) {
  const { categories } = useCategories()
  const [mode, setMode] = useState<Mode>('both')

  const { slices, total, allGeneral } = useMemo(() => {
    const knownIds = new Set(categories.map((c) => c.id))
    const subsMap = monthlySubsByCategory(subscriptions, knownIds)
    const finsMap = monthlyFinsByCategory(financings, knownIds)

    // Combinar según modo
    const combined: Record<string, number> = {}
    if (mode === 'both' || mode === 'subs') {
      for (const [k, v] of Object.entries(subsMap)) combined[k] = (combined[k] ?? 0) + v
    }
    if (mode === 'both' || mode === 'fins') {
      for (const [k, v] of Object.entries(finsMap)) combined[k] = (combined[k] ?? 0) + v
    }

    const total = Object.values(combined).reduce((acc, v) => acc + v, 0)
    if (total === 0) return { slices: [] as Slice[], total: 0, allGeneral: false }

    // ¿Todo es General?
    const nonGeneralKeys = Object.keys(combined).filter((k) => k !== 'general' && combined[k] > 0)
    const allGeneral = nonGeneralKeys.length === 0

    // Convertir a slices, ordenadas por importe desc
    const entries = Object.entries(combined)
      .filter(([, amount]) => amount > 0)
      .sort((a, b) => b[1] - a[1])

    let currentAngle = 0
    const slices: Slice[] = entries.map(([id, amount]) => {
      const cat = findCategory(categories, id)
      const pct = amount / total
      const sliceAngle = pct * 360
      const slice: Slice = {
        categoryId: id,
        label: cat.label,
        emoji: cat.emoji,
        color: cat.color,
        amount,
        pct,
        startAngle: currentAngle,
        endAngle: currentAngle + sliceAngle,
      }
      currentAngle += sliceAngle
      return slice
    })

    return { slices, total, allGeneral }
  }, [subscriptions, financings, mode, categories])

  return (
    <section className="card p-5">
      {/* Cabecera + toggle */}
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted mb-1">
            Gasto por categoría
          </h2>
          <p className="text-[12px] text-muted">Coste mensual equivalente</p>
        </div>
        <div className="inline-flex p-0.5 rounded-lg bg-[var(--bg)] border border-subtle">
          {(['both', 'subs', 'fins'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-2.5 py-1 text-[11.5px] font-medium rounded-md transition-colors ${
                mode === m
                  ? 'bg-[var(--ink)] text-[var(--bg)]'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {m === 'both' ? 'Ambos' : m === 'subs' ? 'Subs' : 'Financ.'}
            </button>
          ))}
        </div>
      </div>

      {/* Estado vacío / sin categorización */}
      {total === 0 ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-2">📊</div>
          <p className="text-sm text-muted">
            {mode === 'subs'
              ? 'No hay gasto activo en suscripciones.'
              : mode === 'fins'
                ? 'No hay financiaciones activas.'
                : 'No hay gasto activo.'}
          </p>
        </div>
      ) : allGeneral ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-2">🏷️</div>
          <p className="text-sm text-muted max-w-xs mx-auto">
            Asigna categorías a tus elementos para ver el desglose.
          </p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center gap-5">
          {/* Donut SVG */}
          <DonutSVG slices={slices} total={total} />

          {/* Leyenda */}
          <ul className="flex-1 w-full space-y-1.5 min-w-0">
            {slices.map((s) => (
              <li
                key={s.categoryId}
                className="flex items-center gap-2.5 text-sm"
              >
                <span
                  className="h-3 w-3 rounded-sm shrink-0"
                  style={{ background: s.color }}
                  aria-hidden
                />
                <span className="text-[14px] leading-none">{s.emoji}</span>
                <span className="flex-1 truncate text-ink">{s.label}</span>
                <span className="text-muted tabular-nums shrink-0 text-[12px]">
                  {Math.round(s.pct * 100)}%
                </span>
                <span className="text-ink tabular-nums shrink-0 font-medium text-[13px] min-w-[60px] text-right">
                  {formatEuroSmart(s.amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

/* -------------------------------------------------------------------- */
/* Donut SVG                                                            */
/* -------------------------------------------------------------------- */
function DonutSVG({ slices, total }: { slices: Slice[]; total: number }) {
  const size = 160
  const radius = 70
  const inner = 48
  const center = size / 2

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`translate(${center} ${center}) rotate(-90)`}>
          {slices.map((s, i) => {
            // Una sola slice del 100% se renderiza como anillo completo
            if (slices.length === 1) {
              return (
                <g key={i}>
                  <circle cx={0} cy={0} r={radius} fill={s.color} />
                  <circle cx={0} cy={0} r={inner} fill="var(--card)" />
                </g>
              )
            }
            return (
              <motion.path
                key={i}
                d={describeArc(0, 0, radius, inner, s.startAngle, s.endAngle)}
                fill={s.color}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
              />
            )
          })}
        </g>
      </svg>
      {/* Total en el centro */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[10px] uppercase tracking-wider text-muted font-semibold">Total</span>
        <span className="text-[15px] font-semibold text-ink tabular-nums leading-tight">
          {formatEuroSmart(total)}
        </span>
        <span className="text-[10px] text-muted">/ mes</span>
      </div>
    </div>
  )
}

/** Polar -> Cartesian con grados (0° apunta a la derecha, sentido horario). */
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

/** Genera una donut slice path (anillo segmentado) entre dos ángulos. */
function describeArc(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
): string {
  const startOuter = polarToCartesian(cx, cy, outerR, startAngle)
  const endOuter = polarToCartesian(cx, cy, outerR, endAngle)
  const startInner = polarToCartesian(cx, cy, innerR, endAngle)
  const endInner = polarToCartesian(cx, cy, innerR, startAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
    'Z',
  ].join(' ')
}
