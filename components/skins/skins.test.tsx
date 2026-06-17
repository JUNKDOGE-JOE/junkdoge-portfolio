import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MediaImageSkin } from './MediaImageSkin'
import { DevSkin } from './DevSkin'
import type { Project } from '@/content/projects'

vi.mock('next/image', () => ({ default: (p: Record<string, unknown>) => <img alt={(p.alt as string) ?? ''} /> }))

const base: Project = { slug: 'x', type: 'pv', featured: true, order: 1, year: '2024',
  title: { zh: '', en: '' }, role: { zh: '', en: '' }, desc: { zh: '', en: '' }, cover: '/covers/x.jpg', links: {} }

describe('skins', () => {
  it('renders media skin for image works', () => {
    render(<MediaImageSkin project={base} />)
    expect(screen.getByTestId('media-skin')).toBeInTheDocument()
  })
  it('renders dev skin', () => {
    render(<DevSkin project={{ ...base, type: 'dev' }} />)
    expect(screen.getByTestId('dev-skin')).toBeInTheDocument()
  })
})
