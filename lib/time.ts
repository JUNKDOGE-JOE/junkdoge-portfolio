export function formatClock(
  date: Date,
  timeZone: string,
  city: string,
  lang: 'zh' | 'en' = 'en',
): string {
  const tz =
    new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'short' })
      .formatToParts(date)
      .find((p) => p.type === 'timeZoneName')?.value ?? ''
  if (lang === 'zh') {
    // e.g. 杭州，凌晨12:20 GMT+8
    const time = new Intl.DateTimeFormat('zh-CN', {
      hour: 'numeric', minute: '2-digit', hour12: true, timeZone,
    }).format(date)
    return `${city}，${time} ${tz}`
  }
  const time = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true, timeZone,
  }).format(date)
  return `${city.toUpperCase()}, ${time} ${tz}`
}
