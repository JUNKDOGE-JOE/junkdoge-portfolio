import { projects, type Project } from '@/content/projects'

export function getHomeProjects(all: Project[] = projects): Project[] {
  return all.filter((p) => p.featured).sort((a, b) => a.order - b.order)
}

export function isImageSkin(p: Project): boolean {
  return p.type !== 'dev'
}

export function galleryFor(p: Project): string[] {
  // dev projects ship 5 portrait UI shots; everyone else has 4 landscape stills
  const count = p.type === 'dev' ? 5 : 4
  return Array.from({ length: count }, (_, i) => `/gallery/${p.slug}/${i + 1}.jpg`)
}
