import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { projectMonthlySpend, formatEuroSmart } from '../../lib/calculations'
import type { Financing, Subscription } from '../../lib/types'
import { useTheme } from '../../hooks/useTheme'

interface Props {
  subscriptions: Subscription[]
  financings: Financing[]
}

type Series = 'both' | 'subs' | 'fins'

export function SpendChart({ subscriptions, financings }: Props) {
  const { theme } = useTheme()
  const [series, setSeries] = useState<Series>('both')
  const data = useMemo(
    () => projectMonthlySpend(subscriptions, financings, 12),
    [subscriptions, financings],
  )

  const isDark = theme === 'dark'
  const subsColor = isDark ? '#34D399' : '#34D399'
  const finsColor = isDark ? '#8B5CF6' : '#8B5CF6'
  const subsGrad = 'subs-grad'
  const finsGrad = 'fins-grad'
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const tickColor = isDark ? '#A1A1AA' : '#6B7280'

  const showSubs = series === 'both' || series === 'subs'
  const showFins = series === 'both' || series === 'fins'

  const hasData = data.some((d) => d.total > 0)

  return (
    <section className="card p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-xs font-medium text-muted uppercase tracking-[0.18em]">
            Próximos 12 meses
          </h2>
          <p className="text-base font-semibold text-ink mt-1 tracking-tight">
            Evolución del gasto
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl border border-subtle bg-[var(--bg)]">
          <SeriesToggle active={series === 'both'} onClick={() => setSeries('both')}>
            Ambos
          </SeriesToggle>
          <SeriesToggle active={series === 'subs'} onClick={() => setSeries('subs')}>
            <Dot color={subsColor} /> Subs
          </SeriesToggle>
          <SeriesToggle active={series === 'fins'} onClick={() => setSeries('fins')}>
            <Dot color={finsColor} /> Financ.
          </SeriesToggle>
        </div>
      </div>

      {hasData ? (
        <div className="h-64 md:h-80 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id={subsGrad} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={subsColor} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={subsColor} stopOpacity={0} />
                </linearGradient>
                <linearGradient id={finsGrad} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={finsColor} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={finsColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 4" vertical={false} />
              <XAxis
                dataKey="label"
                stroke={tickColor}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fontFamily: 'inherit' }}
                dy={6}
              />
              <YAxis
                stroke={tickColor}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fontFamily: 'inherit' }}
                tickFormatter={(v) => `${v}€`}
                width={48}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{
                  stroke: gridColor,
                  strokeWidth: 1,
                  strokeDasharray: '3 3',
                }}
              />
              {showSubs && (
                <Area
                  type="monotone"
                  dataKey="subsTotal"
                  name="Suscripciones"
                  stroke={subsColor}
                  strokeWidth={2.2}
                  fill={`url(#${subsGrad})`}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              )}
              {showFins && (
                <Area
                  type="monotone"
                  dataKey="finsTotal"
                  name="Financiaciones"
                  stroke={finsColor}
                  strokeWidth={2.2}
                  fill={`url(#${finsGrad})`}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-center gap-2">
          <div className="text-2xl">📈</div>
          <p className="text-sm text-muted max-w-xs">
            Aún no hay datos suficientes para mostrar la proyección. Añade tu primera
            suscripción o financiación.
          </p>
        </div>
      )}
    </section>
  )
}

function SeriesToggle({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-7 px-2.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
        active
          ? 'bg-card text-ink shadow-sm border border-subtle'
          : 'text-muted hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

function Dot({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 rounded-full"
      style={{ background: color }}
    />
  )
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null
  const subs = payload.find((p: any) => p.dataKey === 'subsTotal')?.value ?? 0
  const fins = payload.find((p: any) => p.dataKey === 'finsTotal')?.value ?? 0
  const total = subs + fins
  return (
    <div
      className="rounded-xl px-3.5 py-3 text-xs shadow-xl"
      style={{
        background: 'var(--tooltip-bg)',
        border: '1px solid var(--tooltip-border)',
        color: 'var(--ink)',
      }}
    >
      <div className="font-medium text-ink mb-2 capitalize">{label}</div>
      <div className="space-y-1.5">
        {payload.find((p: any) => p.dataKey === 'subsTotal') && (
          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-muted">
              <Dot color="#34D399" />
              Suscripciones
            </span>
            <span className="tabular-nums font-medium">{formatEuroSmart(subs)}</span>
          </div>
        )}
        {payload.find((p: any) => p.dataKey === 'finsTotal') && (
          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-muted">
              <Dot color="#8B5CF6" />
              Financiaciones
            </span>
            <span className="tabular-nums font-medium">{formatEuroSmart(fins)}</span>
          </div>
        )}
        <div className="flex items-center justify-between gap-6 pt-1.5 mt-1.5 border-t border-subtle">
          <span className="text-ink font-medium">Total</span>
          <span className="tabular-nums font-semibold">{formatEuroSmart(total)}</span>
        </div>
      </div>
    </div>
  )
}
