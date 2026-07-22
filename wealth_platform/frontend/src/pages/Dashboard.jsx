import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { api, formatPct, formatUsd } from '../api'
import LiveValue from '../components/LiveValue'
import { useLivePrices } from '../hooks/useLivePrices'

const PIE_COLORS = ['#c4a574', '#8fae8b', '#6a9b8e', '#dbbf8a', '#4d7a6e', '#e8eee9']

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: '#122c27',
        border: '1px solid rgba(196,165,116,0.25)',
        padding: '0.55rem 0.75rem',
        borderRadius: 8,
        fontSize: 13,
      }}
    >
      <div style={{ color: '#9aaba4' }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{formatUsd(payload[0].value)}</div>
    </div>
  )
}

export default function Dashboard() {
  const [bootstrapSummary, setBootstrapSummary] = useState(null)
  const [bootstrapHoldings, setBootstrapHoldings] = useState([])
  const [recent, setRecent] = useState([])
  const [history, setHistory] = useState([])
  const [spending, setSpending] = useState([])
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const [chartMode, setChartMode] = useState('live')

  const load = useCallback(async () => {
    const [dash, trends] = await Promise.all([api.dashboard(), api.trends()])
    setBootstrapSummary(dash.summary)
    setBootstrapHoldings(dash.holdings)
    setRecent(dash.recent_transactions)
    setHistory(
      trends.net_worth.map((s) => ({
        ...s,
        label: new Date(s.recorded_at).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        }),
      })),
    )
    setSpending(trends.spending_by_category)
    setReady(true)
    return dash
  }, [])

  const live = useLivePrices({ enabled: ready && !error })

  useEffect(() => {
    let cancelled = false
    load().catch((err) => {
      if (!cancelled) setError(err.message)
    })
    return () => {
      cancelled = true
    }
  }, [load])

  const summary = live.summary || bootstrapSummary
  const holdings = live.holdings.length ? live.holdings : bootstrapHoldings
  const allocation = live.allocation

  // Seed allocation from holdings if live hasn't returned yet
  const pieData = useMemo(() => {
    if (allocation.length) return allocation
    const map = {}
    holdings.forEach((h) => {
      map[h.asset_class] = (map[h.asset_class] || 0) + h.market_value
    })
    return Object.entries(map).map(([asset_class, amount]) => ({ asset_class, amount }))
  }, [allocation, holdings])

  const chartData = chartMode === 'live' && live.intraday.length > 1 ? live.intraday : history

  if (error) return <p className="error">{error}</p>
  if (!summary) return <p style={{ color: 'var(--muted)' }}>Loading portfolio…</p>

  // bootstrap may not include holdings array when from summary-only — handle
  return (
    <>
      <header className="page-head">
        <div>
          <h1>Overview</h1>
          <p>Mark-to-market every few seconds. Prices tick while markets are open; after hours you see the accurate last print.</p>
        </div>
        <div className="live-pill">
          <i />
          Live{live.liveAt ? ` · ${live.liveAt.toLocaleTimeString()}` : ''}
        </div>
      </header>

      <section className="stats">
        <div className="stat">
          <div className="label">Net worth</div>
          <div className="value">
            <LiveValue value={summary.total_value} />
          </div>
        </div>
        <div className="stat">
          <div className="label">Invested</div>
          <div className="value">
            <LiveValue value={summary.invested_value} />
          </div>
        </div>
        <div className="stat">
          <div className="label">Cash</div>
          <div className="value mono">{formatUsd(summary.cash_balance)}</div>
        </div>
        <div className="stat">
          <div className="label">Unrealized P/L</div>
          <div className="value">
            <LiveValue value={summary.unrealized_pl} />
          </div>
          <div className={`delta ${summary.unrealized_pl >= 0 ? 'up' : 'down'}`}>
            {summary.unrealized_pl >= 0 ? 'Gain' : 'Loss'} vs cost basis
          </div>
        </div>
      </section>

      <section className="grid-2">
        <div className="panel">
          <div className="panel-head">
            <h2>{chartMode === 'live' ? 'Live net worth' : '90-day trend'}</h2>
            <div className="chart-toggle">
              <button
                type="button"
                className={chartMode === 'live' ? 'active' : ''}
                onClick={() => setChartMode('live')}
              >
                Live
              </button>
              <button
                type="button"
                className={chartMode === 'history' ? 'active' : ''}
                onClick={() => setChartMode('history')}
              >
                90d
              </button>
            </div>
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="nw" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c4a574" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#c4a574" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#9aaba4', fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis
                  tick={{ fill: '#9aaba4', fontSize: 11 }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  width={48}
                  domain={['auto', 'auto']}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="total_value"
                  stroke="#c4a574"
                  fill="url(#nw)"
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <h2>Allocation</h2>
          <div className="chart-wrap">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="amount"
                  nameKey="asset_class"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={3}
                  isAnimationActive={false}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatUsd(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', marginTop: '0.25rem' }}>
            {pieData.map((a, i) => (
              <span key={a.asset_class} style={{ fontSize: 12, color: 'var(--muted)' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: PIE_COLORS[i % PIE_COLORS.length],
                    marginRight: 6,
                  }}
                />
                {a.asset_class}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="grid-2">
        <div className="panel">
          <h2>Top holdings</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Price</th>
                  <th>Value</th>
                  <th>P/L</th>
                </tr>
              </thead>
              <tbody>
                {holdings.slice(0, 6).map((h) => (
                  <tr key={h.id}>
                    <td>
                      <strong>{h.symbol}</strong>
                      <div style={{ color: 'var(--muted)', fontSize: 12 }}>{h.name}</div>
                    </td>
                    <td>
                      <LiveValue value={h.current_price} />
                    </td>
                    <td>
                      <LiveValue value={h.market_value} />
                    </td>
                    <td className={`mono ${h.unrealized_pl >= 0 ? 'delta up' : 'delta down'}`}>
                      {formatUsd(h.unrealized_pl)} ({formatPct(h.unrealized_pl_pct)})
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <h2>Spending by category</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {spending.length === 0 && (
                  <tr>
                    <td colSpan={2} style={{ color: 'var(--muted)' }}>
                      No expenses in the last 90 days.
                    </td>
                  </tr>
                )}
                {spending.map((s) => (
                  <tr key={s.category}>
                    <td>{s.category}</td>
                    <td className="mono">{formatUsd(s.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h2 style={{ marginTop: '1.5rem' }}>Recent activity</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Detail</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((t) => (
                  <tr key={t.id}>
                    <td style={{ textTransform: 'capitalize' }}>{t.kind}</td>
                    <td>
                      {t.description || t.category}
                      <div style={{ color: 'var(--muted)', fontSize: 12 }}>
                        {new Date(t.occurred_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="mono">{formatUsd(t.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  )
}
