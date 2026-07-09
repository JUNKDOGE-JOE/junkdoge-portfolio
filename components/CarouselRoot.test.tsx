import { afterEach, describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CarouselRoot } from './CarouselRoot'
import { LangProvider } from '@/lib/i18n'
import type { Project } from '@/content/projects'

vi.mock('next/image', () => ({ default: (p: Record<string, unknown>) => <img alt={(p.alt as string) ?? ''} /> }))

vi.mock('framer-motion', () => {
  const Strip = ({ children, variants, initial, animate, exit, transition, custom, layout, ...rest }: any) =>
    <div {...rest}>{children}</div>
  return { AnimatePresence: ({ children }: any) => children, motion: new Proxy({}, { get: () => Strip }) }
})

const mk = (slug: string, order: number): Project => ({ slug, type: 'pv', featured: true, order, year: '2024',
  title: { zh: slug, en: slug }, role: { zh: '', en: '' }, desc: { zh: '', en: '' }, cover: `/c/${slug}.jpg`, links: {} })

describe('CarouselRoot', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('advances on ArrowRight and wraps', async () => {
    render(<LangProvider><CarouselRoot projects={[mk('a', 1), mk('b', 2)]} /></LangProvider>)
    expect(screen.getByRole('heading')).toHaveTextContent('a')
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('heading')).toHaveTextContent('b')
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('heading')).toHaveTextContent('a')
  })

  it('loads GitHub stars once when the carousel opens', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ stargazers_count: 24 }),
    })
    vi.stubGlobal('fetch', fetcher)
    const project: Project = {
      ...mk('after-effects-mcp', 1),
      type: 'dev',
      desc: { zh: 'AE 自动化', en: 'AE automation' },
      links: { github: 'https://github.com/JUNKDOGE-JOE/after-effects-mcp' },
    }

    render(<LangProvider><CarouselRoot projects={[project]} /></LangProvider>)

    expect(await screen.findByText(/⭐24/)).toBeInTheDocument()
    expect(fetcher).toHaveBeenCalledOnce()
  })
})
