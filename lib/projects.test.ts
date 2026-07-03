import { describe, it, expect } from 'vitest'
import { getHomeProjects, isImageSkin } from '@/lib/projects'
import { projects } from '@/content/projects'
import type { Project } from '@/content/projects'

const mk = (slug: string, order: number, featured: boolean, type: Project['type'] = 'pv'): Project => ({
  slug, type, featured, order, year: '2024',
  title: { zh: slug, en: slug }, role: { zh: '', en: '' }, desc: { zh: '', en: '' },
  cover: `/covers/${slug}.jpg`, links: {},
})

describe('getHomeProjects', () => {
  it('returns only featured, sorted by order', () => {
    const input = [mk('b', 2, true), mk('z', 9, false), mk('a', 1, true)]
    expect(getHomeProjects(input).map(p => p.slug)).toEqual(['a', 'b'])
  })
})

describe('isImageSkin', () => {
  it('is true for pv/vj/collab, false for dev', () => {
    expect(isImageSkin(mk('x', 1, true, 'pv'))).toBe(true)
    expect(isImageSkin(mk('x', 1, true, 'vj'))).toBe(true)
    expect(isImageSkin(mk('x', 1, true, 'collab'))).toBe(true)
    expect(isImageSkin(mk('x', 1, true, 'dev'))).toBe(false)
  })
})

describe('projects.json migration', () => {
  it('loads featured projects with required fields', () => {
    const featured = projects.filter((p) => p.featured)
    expect(featured.length).toBeGreaterThan(0)
    for (const p of featured) {
      expect(p.slug).toBeTruthy()
      expect(p.title.zh).toBeTruthy()
      expect(p.cover.startsWith('/covers/')).toBe(true)
      expect(p.links).toBeDefined()
    }
  })
  it('keeps fusang as order 1', () => {
    expect(projects.find(p => p.slug === 'fusang')?.order).toBe(1)
  })
})
