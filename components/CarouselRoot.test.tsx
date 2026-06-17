import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CarouselRoot } from './CarouselRoot'
import { LangProvider } from '@/lib/i18n'
import type { Project } from '@/content/projects'

vi.mock('next/image', () => ({ default: (p: Record<string, unknown>) => <img alt={(p.alt as string) ?? ''} /> }))

const mk = (slug: string, order: number): Project => ({ slug, type: 'pv', featured: true, order, year: '2024',
  title: { zh: slug, en: slug }, role: { zh: '', en: '' }, desc: { zh: '', en: '' }, cover: `/c/${slug}.jpg`, links: {} })

describe('CarouselRoot', () => {
  it('advances on ArrowRight and wraps', async () => {
    render(<LangProvider><CarouselRoot projects={[mk('a', 1), mk('b', 2)]} /></LangProvider>)
    expect(screen.getByRole('heading')).toHaveTextContent('a')
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('heading')).toHaveTextContent('b')
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('heading')).toHaveTextContent('a')
  })
})
