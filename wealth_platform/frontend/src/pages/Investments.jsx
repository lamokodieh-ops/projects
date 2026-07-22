import { useEffect, useState } from 'react'
import { api, formatPct, formatUsd } from '../api'
import { useAuth } from '../AuthContext'

const EMPTY = {
  symbol: '',
  name: '',
  shares: '',
  avg_cost: '',
  current_price: '',
  asset_class: 'Equity',
}

export default function Investments() {
  const { setUser, user } = useAuth()
  const [items, setItems] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    const data = await api.investments()
    setItems(data.investments)
  }

  useEffect(() => {
    load().catch((err) => setError(err.message))
  }, [])

  async function onAdd(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const data = await api.addInvestment({
        ...form,
        shares: Number(form.shares),
        avg_cost: Number(form.avg_cost),
        current_price: Number(form.current_price || form.avg_cost),
      })
      setForm(EMPTY)
      setUser({ ...user, cash_balance: data.cash_balance })
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function onSell(id) {
    if (!confirm('Sell this entire position at the current price?')) return
    setError('')
    try {
      const data = await api.sellInvestment(id)
      setUser({ ...user, cash_balance: data.cash_balance })
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Investments</h1>
          <p>Track holdings with cost basis and live mark-to-market value.</p>
        </div>
        <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
          Cash available: <strong className="mono">{formatUsd(user?.cash_balance)}</strong>
        </div>
      </header>

      <div className="panel" style={{ marginBottom: '1.25rem' }}>
        <h2>Add position</h2>
        <form className="form-row" onSubmit={onAdd}>
          <div className="field">
            <label>Symbol</label>
            <input
              value={form.symbol}
              onChange={(e) => setForm({ ...form, symbol: e.target.value })}
              required
              placeholder="AAPL"
            />
          </div>
          <div className="field">
            <label>Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Apple Inc."
            />
          </div>
          <div className="field">
            <label>Shares</label>
            <input
              type="number"
              step="any"
              min="0"
              value={form.shares}
              onChange={(e) => setForm({ ...form, shares: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>Avg cost</label>
            <input
              type="number"
              step="any"
              min="0"
              value={form.avg_cost}
              onChange={(e) => setForm({ ...form, avg_cost: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>Price</label>
            <input
              type="number"
              step="any"
              min="0"
              value={form.current_price}
              onChange={(e) => setForm({ ...form, current_price: e.target.value })}
              placeholder="Optional"
            />
          </div>
          <div className="field">
            <label>Class</label>
            <select
              value={form.asset_class}
              onChange={(e) => setForm({ ...form, asset_class: e.target.value })}
            >
              <option>Equity</option>
              <option>ETF</option>
              <option>Fixed Income</option>
              <option>Crypto</option>
              <option>Commodity</option>
            </select>
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: 'auto' }}>
            {busy ? 'Saving…' : 'Buy / add'}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>

      <div className="panel">
        <h2>Portfolio holdings</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Shares</th>
                <th>Avg cost</th>
                <th>Price</th>
                <th>Value</th>
                <th>P/L</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((h) => (
                <tr key={h.id}>
                  <td>
                    <strong>{h.symbol}</strong>
                    <div style={{ color: 'var(--muted)', fontSize: 12 }}>
                      {h.name} · {h.asset_class}
                    </div>
                  </td>
                  <td className="mono">{h.shares}</td>
                  <td className="mono">{formatUsd(h.avg_cost)}</td>
                  <td className="mono">{formatUsd(h.current_price)}</td>
                  <td className="mono">{formatUsd(h.market_value)}</td>
                  <td className={`mono ${h.unrealized_pl >= 0 ? 'delta up' : 'delta down'}`}>
                    {formatUsd(h.unrealized_pl)}
                    <div style={{ fontSize: 12 }}>{formatPct(h.unrealized_pl_pct)}</div>
                  </td>
                  <td>
                    <button type="button" className="btn btn-danger" onClick={() => onSell(h.id)}>
                      Sell
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ color: 'var(--muted)' }}>
                    No holdings yet. Add a position above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}