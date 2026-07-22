const TOKEN_KEY = 'fortis_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(path, { ...options, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`)
  }
  return data
}

export const api = {
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/api/auth/me'),
  dashboard: () => request('/api/dashboard'),
  trends: () => request('/api/trends'),
  refreshPrices: (maxCalls = 2) =>
    request(`/api/prices/refresh?max_calls=${maxCalls}`, { method: 'POST' }),
  investments: () => request('/api/investments'),
  addInvestment: (body) =>
    request('/api/investments', { method: 'POST', body: JSON.stringify(body) }),
  sellInvestment: (id) => request(`/api/investments/${id}`, { method: 'DELETE' }),
  transactions: () => request('/api/transactions'),
  addTransaction: (body) =>
    request('/api/transactions', { method: 'POST', body: JSON.stringify(body) }),
  deleteTransaction: (id) => request(`/api/transactions/${id}`, { method: 'DELETE' }),
}

export function formatUsd(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(n ?? 0)
}

export function formatPct(n) {
  const sign = n > 0 ? '+' : ''
  return `${sign}${(n ?? 0).toFixed(2)}%`
}