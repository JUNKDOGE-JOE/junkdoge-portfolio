'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

/**
 * Touch-device replacement for the mouse: maps the gyroscope
 * (DeviceOrientationEvent) onto the SAME `--mx` / `--my` virtual-pointer
 * variables the mouse uses — written to <html>, smoothed each frame — so the
 * existing parallax / gradient / tilt effects (all reading var(--mx)) work
 * without a pointer.
 *
 * - gamma (left/right tilt)  → --mx
 * - beta  (front/back tilt)  → --my
 * - calibrates to the pose at first reading (re-centres on enable)
 * - iOS 13+ needs a user-gesture grant → call `enable()` from a tap; on
 *   Android / older iOS it starts automatically.
 *
 * Returns { needsPermission, granted, enable }.
 */
export function useDeviceTilt(active: boolean) {
  const [needsPermission, setNeedsPermission] = useState(false)
  const [granted, setGranted] = useState(false)

  const baseRef = useRef<{ beta: number; gamma: number } | null>(null)
  const target  = useRef({ x: 0.5, y: 0.5 })
  const cur     = useRef({ x: 0.5, y: 0.5 })
  const listening = useRef(false)

  const onOrient = useCallback((e: DeviceOrientationEvent) => {
    const beta  = e.beta  ?? 0   // front/back [-180,180]
    const gamma = e.gamma ?? 0   // left/right [-90,90]
    if (!baseRef.current) baseRef.current = { beta, gamma }
    const dGamma = gamma - baseRef.current.gamma
    const dBeta  = beta  - baseRef.current.beta
    // ±28° of tilt maps to the full 0..1 range
    target.current.x = clamp(0.5 + dGamma / 36, 0, 1)
    target.current.y = clamp(0.5 + dBeta  / 36, 0, 1)
  }, [])

  const startListening = useCallback(() => {
    if (listening.current) return
    listening.current = true
    baseRef.current = null // recalibrate to current pose
    window.addEventListener('deviceorientation', onOrient)
  }, [onOrient])

  /** Call from a user gesture (button tap) — required on iOS. */
  const enable = useCallback(async () => {
    const DOE = window.DeviceOrientationEvent as unknown as
      { requestPermission?: () => Promise<'granted' | 'denied'> }
    if (DOE && typeof DOE.requestPermission === 'function') {
      try {
        const res = await DOE.requestPermission()
        if (res === 'granted') { setGranted(true); setNeedsPermission(false); startListening() }
      } catch { /* user denied */ }
    } else {
      setGranted(true); startListening()
    }
  }, [startListening])

  useEffect(() => {
    if (!active) return
    const DOE = window.DeviceOrientationEvent as unknown as
      { requestPermission?: () => Promise<string> } | undefined
    if (!DOE) return // no gyroscope support
    if (typeof DOE.requestPermission === 'function') {
      setNeedsPermission(true)        // iOS: wait for enable() tap
    } else {
      setGranted(true); startListening() // Android / older: auto
    }

    // smoothing loop → write --mx/--my on <html>
    const root = document.documentElement
    let raf = 0
    const loop = () => {
      cur.current.x += (target.current.x - cur.current.x) * 0.08
      cur.current.y += (target.current.y - cur.current.y) * 0.08
      root.style.setProperty('--mx', cur.current.x.toFixed(3))
      root.style.setProperty('--my', cur.current.y.toFixed(3))
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('deviceorientation', onOrient)
      listening.current = false
      root.style.removeProperty('--mx')
      root.style.removeProperty('--my')
    }
  }, [active, onOrient, startListening])

  return { needsPermission, granted, enable }
}
