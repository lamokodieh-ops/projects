/**
 * In-memory Fortis demo data for static GitHub Pages (no Flask).
 * Mirrors the shape of backend seed + API responses.
 */

const DEMO_USER = {
  id: 1,
  email: 'demo@fortis.app',
  name: 'Alex Meridian',
  cash_balance: 18420.55,
}

const INITIAL_HOLDINGS = [
  { id: 1, symbol: 'AAPL', name: 'Apple Inc.', shares: 42, avg_cost: 168.4, current_price: 214.2, asset_class: 'Equity' },
  { id: 2, symbol: 'MSFT', name: 'Microsoft Corp.', shares: 28, avg_cost: 310.0, current_price: 425.5, asset_class: 'Equity' },
  { id: 3, symbol: 'VTI', name: 'Vanguard Total Stock', shares: 65, avg_cost: 210.0, current_price: 268.3, asset_class: 'ETF' },
  { id: 4, symbol: 'BND', name: 'Vanguard Total Bond', shares: 80, avg_cost: 72.5, current_price: 74.1, asset_class: 'Fixed Income' },
  { id: 5, symbol: 'BTC', name: 'Bitcoin', shares: 0.35, avg_cost: 42000.0, current_price: 68500.0, asset_class: 'Crypto' },
  { id: 6, symbol: 'GLD', name: 'SPDR Gold Shares', shares: 20, avg_cost: 175.0, current_price: 228.4, asset_class: 'Commodity' },
]

const INITIAL_TX = [
  { id: 1, kind: 'income', amount: 5200, category: 'Salary', description: 'March paycheck', daysAgo: 45 },
  { id: 2, kind: 'expense', amount: 1850, category: 'Housing', description: 'Rent', daysAgo: 42 },
  { id: 3, kind: 'expense', amount: 240, category: 'Food', description: 'Groceries', daysAgo: 38 },
  { id: 4, kind: 'expense', amount: 89, category: 'Transport', description: 'Transit pass', daysAgo: 35 },
  { id: 5, kind: 'income', amount: 420, category: 'Dividends', description: 'VTI dividend', daysAgo: 30 },
  { id: 6, kind: 'expense', amount: 65, category: 'Subscriptions', description: 'Software tools', daysAgo: 28 },
  { id: 7, kind: 'buy', amount: 2100, category: 'Investing', description: 'Added to VTI', daysAgo: 25 },
  { id: 8, kind: 'expense', amount: 120, category: 'Health', description: 'Pharmacy', daysAgo: 20 },
  { id: 9, kind: 'expense', amount: 310, category: 'Food', description: 'Dining out', daysAgo: 14 },
  { id: 10, kind: 'income', amount: 200, category: 'Transfers', description: 'Side project', daysAgo: 10 },
  { id: 11, kind: 'expense', amount: 55, category: 'Entertainment', description: 'Concert', daysAgo: 7 },
  { id: 12, kind: 'expense', amount: 48, category: 'Utilities', description: 'Electric bill', daysAgo: 3 },
]

function daysAgoIso(days) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

function enrichHolding(h) {
  const market_value = h.shares * h.current_price
  const cost_basis = h.shares * h.avg_cost
  const unrealized_pl = market_value - cost_basis
  const unrealized_pl_pct = cost_basis > 0 ? (unrealized_pl / cost_basis) * 100 : 0
  return {
    ...h,
    symbol: h.symbol.toUpperCase(),
    shares: Math.round(h.shares * 10000) / 10000,
    avg_cost: Math.round(h.avg_cost * 100) / 100,
    current_price: Math.round(h.current_price * 100) / 100,
    market_value: Math.round(market_value * 100) / 100,
    cost_basis: Math.round(cost_basis * 100) / 100,
    unrealized_pl: Math.round(unrealized_pl * 100) / 100,
    unrealized_pl_pct: Math.round(unrealized_pl_pct * 100) / 100,
    updated_at: new Date().toISOString(),
  }
}

function buildSnapshots(invested, cash) {
  let value = invested + cash
  const snaps = []
  for (let day = 90; day >= 0; day -= 1) {
    value *= 1 + (Math.random() * 0.02 - 0.008)
    const cash_part = cash * (0.95 + Math.random() * 0.1)
    const invested_part = Math.max(0, value - cash_part)
    snaps.push({
      total_value: Math.round(value * 100) / 100,
      invested_value: Math.round(invested_part * 100) / 100,
      cash_balance: Math.round(cash_part * 100) / 100,
      recorded_at: daysAgoIso(day),
    })
  }
  return snaps
}

function createState() {
  const holdings = INITIAL_HOLDINGS.map((h) => enrichHolding({ ...h }))
  const invested = holdings.reduce((s, h) => s + h.market_value, 0)
  return {
    user: { ...DEMO_USER },
    holdings,
    transactions: INITIAL_TX.map((t) => ({
      id: t.id,
      kind: t.kind,
      amount: t.amount,
      category: t.category,
      description: t.description,
      occurred_at: daysAgoIso(t.daysAgo),
    })),
    snapshots: buildSnapshots(invested, DEMO_USER.cash_balance),
    nextInvId: 7,
    nextTxId: 13,
  }
}

let state = createState()

function totals() {
  const invested = state.holdings.reduce((s, h) => s + h.market_value, 0)
  const cash = state.user.cash_balance
  const unrealized = state.holdings.reduce((s, h) => s + h.unrealized_pl, 0)
  return {
    invested_value: Math.round(invested * 100) / 100,
    cash_balance: Math.round(cash * 100) / 100,
    total_value: Math.round((invested + cash) * 100) / 100,
    unrealized_pl: Math.round(unrealized * 100) / 100,
  }
}

function allocation() {
  const map = {}
  for (const h of state.holdings) {
    map[h.asset_class] = (map[h.asset_class] || 0) + h.market_value
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([asset_class, amount]) => ({
      asset_class,
      amount: Math.round(amount * 100) / 100,
    }))
}

function delay(ms = 80) {
  return new Promise((r) => setTimeout(r, ms))
}

export const isDemo = import.meta.env.VITE_DEMO === 'true'

export const demoApi = {
  async register({ name, email }) {
    await delay()
    state.user = { ...state.user, name: name || 'Demo User', email: email || DEMO_USER.email }
    return { access_token: 'demo-token', user: { ...state.user } }
  },

  async login({ email }) {
    await delay()
    state.user = { ...state.user, email: email || DEMO_USER.email }
    return { access_token: 'demo-token', user: { ...state.user } }
  },

  async me() {
    await delay(40)
    return { user: { ...state.user } }
  },

  async dashboard() {
    await delay()
    const holdings = [...state.holdings].sort((a, b) => b.market_value - a.market_value)
    const recent = [...state.transactions]
      .sort((a, b) => new Date(b.occurred_at) - new Date(a.occurred_at))
      .slice(0, 8)
    return {
      summary: totals(),
      holdings,
      recent_transactions: recent,
    }
  },

  async trends() {
    await delay()
    const expenses = state.transactions.filter((t) => t.kind === 'expense')
    const byCat = {}
    for (const tx of expenses) {
      byCat[tx.category] = (byCat[tx.category] || 0) + Math.abs(tx.amount)
    }
    return {
      net_worth: state.snapshots,
      spending_by_category: Object.entries(byCat)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([category, amount]) => ({ category, amount: Math.round(amount * 100) / 100 })),
      allocation: allocation(),
    }
  },

  async refreshPrices() {
    await delay(120)
    const sources = {}
    for (const h of state.holdings) {
      const jitter = 1 + (Math.random() * 0.006 - 0.003)
      h.current_price = Math.round(h.current_price * jitter * 100) / 100
      Object.assign(h, enrichHolding(h))
      sources[h.symbol] = 'demo'
    }
    const summary = totals()
    state.snapshots.push({
      total_value: summary.total_value,
      invested_value: summary.invested_value,
      cash_balance: summary.cash_balance,
      recorded_at: new Date().toISOString(),
    })
    if (state.snapshots.length > 120) state.snapshots = state.snapshots.slice(-120)
    const holdings = [...state.holdings].sort((a, b) => b.market_value - a.market_value)
    return {
      summary,
      holdings,
      snapshot: state.snapshots[state.snapshots.length - 1],
      allocation: allocation(),
      updated: holdings.length,
      sources,
      server_time: new Date().toISOString(),
    }
  },

  async investments() {
    await delay()
    return { investments: state.holdings.map((h) => ({ ...h })) }
  },

  async addInvestment(body) {
    await delay()
    const shares = Number(body.shares)
    const avg_cost = Number(body.avg_cost)
    const price = Number(body.current_price || avg_cost)
    const cost = shares * avg_cost
    if (cost > state.user.cash_balance) {
      throw new Error('Insufficient cash balance.')
    }
    state.user.cash_balance = Math.round((state.user.cash_balance - cost) * 100) / 100
    const inv = enrichHolding({
      id: state.nextInvId++,
      symbol: (body.symbol || 'NEW').toUpperCase(),
      name: body.name || body.symbol || 'Holding',
      shares,
      avg_cost,
      current_price: price,
      asset_class: body.asset_class || 'Equity',
    })
    state.holdings.push(inv)
    state.transactions.unshift({
      id: state.nextTxId++,
      kind: 'buy',
      amount: Math.round(cost * 100) / 100,
      category: 'Investing',
      description: `Bought ${inv.symbol}`,
      occurred_at: new Date().toISOString(),
    })
    return { investment: inv, cash_balance: state.user.cash_balance }
  },

  async sellInvestment(id) {
    await delay()
    const idx = state.holdings.findIndex((h) => h.id === Number(id))
    if (idx < 0) throw new Error('Investment not found.')
    const [inv] = state.holdings.splice(idx, 1)
    state.user.cash_balance =
      Math.round((state.user.cash_balance + inv.market_value) * 100) / 100
    state.transactions.unshift({
      id: state.nextTxId++,
      kind: 'sell',
      amount: inv.market_value,
      category: 'Investing',
      description: `Sold ${inv.symbol}`,
      occurred_at: new Date().toISOString(),
    })
    return { ok: true, cash_balance: state.user.cash_balance }
  },

  async transactions() {
    await delay()
    const items = [...state.transactions].sort(
      (a, b) => new Date(b.occurred_at) - new Date(a.occurred_at),
    )
    return { transactions: items }
  },

  async addTransaction(body) {
    await delay()
    const amount = Number(body.amount)
    const kind = body.kind
    if (!(amount > 0) || !['income', 'expense', 'transfer'].includes(kind)) {
      throw new Error('Kind must be income, expense, or transfer with amount > 0.')
    }
    if (kind === 'expense' && amount > state.user.cash_balance) {
      throw new Error('Insufficient cash for this expense.')
    }
    if (kind === 'income') state.user.cash_balance += amount
    if (kind === 'expense') state.user.cash_balance -= amount
    state.user.cash_balance = Math.round(state.user.cash_balance * 100) / 100
    const tx = {
      id: state.nextTxId++,
      kind,
      amount: Math.round(amount * 100) / 100,
      category: body.category || 'General',
      description: body.description || '',
      occurred_at: body.occurred_at || new Date().toISOString(),
    }
    state.transactions.unshift(tx)
    return { transaction: tx, cash_balance: state.user.cash_balance }
  },

  async deleteTransaction(id) {
    await delay()
    state.transactions = state.transactions.filter((t) => t.id !== Number(id))
    return { ok: true }
  },
}
