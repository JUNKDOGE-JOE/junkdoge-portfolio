'use client'
import { useEffect, useState } from 'react'
import { initSound, isMuted, toggleMuted, onMutedChange, sfxHover } from '@/lib/sound'

/**
 * Small pill toggle for the corner nav. Sound defaults to on, but nothing can
 * play before the first user gesture (autoplay policy), and the choice persists.
 */
export function SoundToggle() {
  const [muted, setMuted] = useState(true)
  useEffect(() => {
    initSound()
    setMuted(isMuted())
    return onMutedChange(setMuted)
  }, [])
  return (
    <button
      onClick={() => toggleMuted()}
      onMouseEnter={() => sfxHover()}
      aria-label={muted ? 'unmute sound effects' : 'mute sound effects'}
      aria-pressed={!muted}
      title={muted ? 'SOUND OFF' : 'SOUND ON'}
      className="rounded-full border border-current px-2 py-0.5 tabular-nums"
      style={{ opacity: muted ? 0.55 : 1 }}
    >
      {muted ? '♪ ×' : '♪ ✓'}
    </button>
  )
}
