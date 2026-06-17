import { describe, it, expect } from 'vitest'
import { formatClock } from '@/lib/time'

describe('formatClock', () => {
  it('prefixes the uppercased city and includes a HH:MM time', () => {
    const out = formatClock(new Date('2024-01-01T08:30:00Z'), 'Asia/Shanghai', 'Beijing')
    expect(out.startsWith('BEIJING, ')).toBe(true)
    expect(out).toMatch(/\d{1,2}:\d{2}/)
  })
})
