'use client'
import { useIsMobile } from '@/lib/useIsMobile'
import { useDeviceTilt } from '@/lib/useDeviceTilt'

/**
 * Mounts the gyroscope→pointer bridge on touch devices. On iOS it renders a
 * one-tap "开启体感" button (Apple requires a user gesture to grant motion
 * access); on Android it starts silently and renders nothing.
 */
export function DeviceTilt() {
  const isMobile = useIsMobile()
  const { needsPermission, granted, enable } = useDeviceTilt(isMobile)

  if (!isMobile || granted || !needsPermission) return null

  return (
    <button
      onClick={enable}
      className="pointer-events-auto fixed bottom-[4.5rem] left-1/2 z-40 -translate-x-1/2
                 rounded-full px-4 py-2 text-[0.62rem] tracking-[0.2em]"
      style={{
        background: 'rgba(18,18,22,0.62)',
        color: 'rgba(255,255,255,0.85)',
        border: '1px solid rgba(255,255,255,0.2)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      ◓ 开启体感
    </button>
  )
}
