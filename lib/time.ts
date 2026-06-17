export function formatClock(date: Date, timeZone: string, city: string): string {
  const time = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true, timeZone, timeZoneName: 'short',
  }).format(date)
  return `${city.toUpperCase()}, ${time}`
}
