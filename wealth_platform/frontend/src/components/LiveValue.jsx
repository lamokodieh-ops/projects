import { useEffect, useRef, useState } from 'react'
import { formatUsd } from '../api'

/** Currency that flashes green/red when the number moves. */
export default function LiveValue({ value, className = '' }) {
  const prev = useRef(value)
  const [flash, setFlash] = useState('')

  useEffect(() => {
    if (prev.current == null || value == null) {
      prev.current = value
      return
    }
    if (Math.abs(value - prev.current) < 0.005) return
    setFlash(value > prev.current ? 'flash-up' : 'flash-down')
    prev.current = value
    const t = setTimeout(() => setFlash(''), 700)
    return () => clearTimeout(t)
  }, [value])

  return <span className={`mono live-value ${flash} ${className}`.trim()}>{formatUsd(value)}</span>
}
