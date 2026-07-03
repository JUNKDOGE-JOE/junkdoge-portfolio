'use client'
// Tiny Web Audio synth — all SFX are generated at runtime, no audio assets.
// Autoplay policy: the AudioContext is created lazily and only resumed after
// the first user gesture, so sounds silently no-op until the user interacts.

const STORAGE_KEY = 'jd.sound'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let unlocked = false
let muted = true
let initialized = false
const listeners = new Set<(m: boolean) => void>()

function ensureCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.55
    master.connect(ctx.destination)
  }
  return ctx
}

/** Call once on the client to restore the saved preference + set up gesture unlock. */
export function initSound() {
  if (typeof window === 'undefined' || initialized) return
  initialized = true
  // Default ON (sounds are quiet and can't play before the first gesture anyway);
  // the visitor's explicit off/on choice is persisted and wins.
  muted = window.localStorage.getItem(STORAGE_KEY) === 'off'
  const unlock = () => {
    unlocked = true
    const c = ensureCtx()
    if (c && c.state === 'suspended') void c.resume()
    window.removeEventListener('pointerdown', unlock)
    window.removeEventListener('keydown', unlock)
  }
  window.addEventListener('pointerdown', unlock, { passive: true })
  window.addEventListener('keydown', unlock)
}

export function isMuted() {
  return muted
}

export function toggleMuted(): boolean {
  muted = !muted
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, muted ? 'off' : 'on')
  }
  listeners.forEach((fn) => fn(muted))
  if (!muted) blip(880, 0.05, 0.12) // audible confirmation when turning on
  return muted
}

export function onMutedChange(fn: (m: boolean) => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function canPlay(): AudioContext | null {
  if (muted || !unlocked) return null
  const c = ensureCtx()
  if (!c || !master) return null
  if (c.state === 'suspended') void c.resume()
  return c
}

/** Short sine blip: hover ticks, boot beeps, confirmations. */
function blip(freq: number, dur: number, vol: number, type: OscillatorType = 'sine') {
  const c = canPlay()
  if (!c || !master) return
  const t = c.currentTime
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(vol, t + 0.005)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(master)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

/** Faint high tick — for link/button hover. Deliberately quiet. */
export function sfxHover() {
  blip(1400, 0.045, 0.05, 'triangle')
}

/** Soft click — button/gallery interactions. */
export function sfxClick() {
  blip(520, 0.09, 0.14, 'triangle')
  blip(1040, 0.05, 0.06, 'sine')
}

/** Filtered-noise whoosh + low thump — carousel slide change. */
export function sfxSlide(dir: 1 | -1 = 1) {
  const c = canPlay()
  if (!c || !master) return
  const t = c.currentTime
  const dur = 0.42

  // noise whoosh through a sweeping bandpass
  const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  const src = c.createBufferSource()
  src.buffer = buf
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.Q.value = 1.1
  const [f0, f1] = dir === 1 ? [420, 1600] : [1600, 420]
  bp.frequency.setValueAtTime(f0, t)
  bp.frequency.exponentialRampToValueAtTime(f1, t + dur)
  const ng = c.createGain()
  ng.gain.setValueAtTime(0, t)
  ng.gain.linearRampToValueAtTime(0.09, t + 0.06)
  ng.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(bp).connect(ng).connect(master)
  src.start(t)

  // low sine thump for weight
  const osc = c.createOscillator()
  const og = c.createGain()
  osc.frequency.setValueAtTime(150, t)
  osc.frequency.exponentialRampToValueAtTime(48, t + 0.3)
  og.gain.setValueAtTime(0.12, t)
  og.gain.exponentialRampToValueAtTime(0.0001, t + 0.32)
  osc.connect(og).connect(master)
  osc.start(t)
  osc.stop(t + 0.35)
}

/** Terminal beep for preloader log lines (pitch rises per line). */
export function sfxBoot(step: number) {
  blip(620 + step * 90, 0.05, 0.07, 'square')
}

/** Two-note "ready" chime when the preloader finishes. */
export function sfxReady() {
  blip(660, 0.14, 0.1)
  setTimeout(() => blip(990, 0.22, 0.1), 110)
}
