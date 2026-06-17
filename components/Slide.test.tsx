import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Slide } from './Slide'
import { LangProvider } from '@/lib/i18n'
import type { Project } from '@/content/projects'

vi.mock('next/image', () => ({ default: (p: Record<string, unknown>) => <img alt={(p.alt as string) ?? ''} /> }))

const pv: Project = { slug: 'fusang', type: 'pv', featured: true, order: 1, year: '2024',
  title: { zh: '扶桑', en: 'THE FUSOR ARBOR' }, role: { zh: 'PV', en: 'PV' }, desc: { zh: '描述', en: 'desc' },
  cover: '/covers/fusang.jpg', links: { bilibili: 'https://b.example/x' } }

describe('Slide', () => {
  it('renders zh title and a working visit link', () => {
    render(<LangProvider><Slide project={pv} /></LangProvider>)
    expect(screen.getByRole('heading', { name: '扶桑' })).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://b.example/x')
  })
})
