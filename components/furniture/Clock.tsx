'use client'
import { useEffect, useState } from 'react'
import { formatClock } from '@/lib/time'
import { useLang } from '@/lib/i18n'

export function Clock({
  city = 'Hangzhou',
  cityZh = '杭州',
  timeZone = 'Asia/Shanghai',
}: { city?: string; cityZh?: string; timeZone?: string }) {
  const { lang } = useLang()
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000 * 30)
    return () => clearInterval(id)
  }, [])
  return (
    <span className="ui-label" suppressHydrationWarning>
      {now ? formatClock(now, timeZone, lang === 'zh' ? cityZh : city, lang) : ''}
    </span>
  )
}
