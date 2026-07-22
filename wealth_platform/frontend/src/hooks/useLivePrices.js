import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../api'

const POLL_MS = 3000

/**
 * Polls /api/prices/refresh every few seconds for live mark-to-market updates.
 */
export function useLivePrices({ enabled = true, onTick } = {}) {
  const [summary, setSummary] = useState(null)
  const [holdings, setHoldings] = useState([])
  const [allocation, setAllocation] = useState([])
  const [liveAt, setLiveAt] = useState(null)
  const [intraday, setIntraday] = useState([])
  const [busy, setBusy] = useState(false)
  const onTickRef = useRef(onTick)
  onTickRef.current = onTick

  const tick = useCallback(async (maxCalls = 2) => {
    setBusy(true)
    try {
      const data = await api.refreshPrices(maxCalls)
      setSummary(data.summary)
      setHoldings(data.holdings)
      if (data.allocation) setAllocation(data.allocation)
      setLiveAt(new Date())
      setIntraday((prev) => {
        const point = {
          total_value: data.summary.total_value,
          label: new Date().toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        }
        return [...prev.slice(-40), point]
      })
      onTickRef.current?.(data)
      return data
    } finally {
      setBusy(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return undefined
    let cancelled = false
    let timer

    ;(async () => {
      try {
        // First paint: pull more quotes so the board isn't stale
        if (!cancelled) await tick(4)
      } catch {
        /* parent may already have dashboard data */
      }
      if (cancelled) return
      timer = setInterval(() => {
        tick(2).catch(() => {})
      }, POLL_MS)
    })()

    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [enabled, tick])

  return { summary, holdings, allocation, liveAt, intraday, busy, tick }
}
