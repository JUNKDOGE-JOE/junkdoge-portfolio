'use client'

import { useEffect } from 'react'

/** 静态导出友好：旧路由跳到主站对应锚点 */
export function HashRedirect({ hash }: { hash: string }) {
  useEffect(() => {
    const target = hash.startsWith('#') ? `/${hash}` : `/#${hash}`
    window.location.replace(target)
  }, [hash])

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#0a0a0b',
        color: '#9a9aa0',
        fontFamily: 'var(--font-noto), system-ui, sans-serif',
        fontSize: '0.75rem',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
      }}
    >
      Redirecting…
    </main>
  )
}
