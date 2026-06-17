import { useEffect, useLayoutEffect } from 'react'

/**
 * useLayoutEffect on the client (runs BEFORE the browser paints, so GSAP can set
 * the initial hidden state of a reveal before the first frame — no flash of the
 * un-set content). Falls back to useEffect on the server to avoid React's SSR
 * "useLayoutEffect does nothing on the server" warning.
 */
export const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect
