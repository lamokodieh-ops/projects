import { useEffect, useState } from 'react'
import { api, formatUsd } from '../api'
import { useAuth } from '../AuthContext'

const EMPTY = {
  kind: 'expense',
  amount: '',
  category: 'General',
  description: '',
}

export default function Transactions() {
  const { user, setUser } = useAuth()
  const [items, setItems] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    const data = await api.transactions()
    setItems(data.transactions)
  }

  useEffect(() => {
    load().catch((err) => setError(err.message))
  }, [])

  async function onAdd(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const data = await api.addTransaction({
        ...form,
        amount: Number(form.amount),
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

  async function onDelete(id) {
    if (!confirm('Delete this transaction record?')) return
    try {
      await api.deleteTransaction(id)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Transactions</h1>
          <p>Record income and expenses to understand cash-flow trends.</p>
        </div>
      </header>

      <div className="panel" style={{ marginBottom: '1.25rem' }}>
        <h2>New transaction</h2>
        <form className="form-row" onSubmit={onAdd}>
          <div className="field">
            <label>Type</label>
            <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
          <div className="field">
            <label>Amount</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>Category</label>
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional note"
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: 'auto' }}>
            {busy ? 'Saving…' : 'Add'}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>

      <div className="panel">
        <h2>History</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id}>
                  <td>{new Date(t.occurred_at).toLocaleDateString()}</td>
                  <td style={{ textTransform: 'capitalize' }}>{t.kind}</td>
                  <td>{t.category}</td>
                  <td>{t.description || '—'}</td>
                  <td className="mono">{formatUsd(t.amount)}</td>
                  <td>
                    <button type="button" className="btn btn-danger" onClick={() => onDelete(t.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ color: 'var(--muted)' }}>
                    No transactions yet.
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