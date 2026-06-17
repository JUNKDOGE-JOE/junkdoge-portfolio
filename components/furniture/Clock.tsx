'use client'
import { useEffect, useState } from 'react'
import { formatClock } from '@/lib/time'

export function Clock({ city = 'Hangzhou', timeZone = 'Asia/Shanghai' }: { city?: string; timeZone?: string }) {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000 * 30)
    return () => clearInterval(id)
  }, [])
  return <span className="ui-label" suppressHydrationWarning>{now ? formatClock(now, timeZone, city) : ''}</span>
}
