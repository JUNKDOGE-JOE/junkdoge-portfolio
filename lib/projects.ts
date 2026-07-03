import { projects, type Project } from '@/content/projects'

export function getHomeProjects(all: Project[] = projects): Project[] {
  return all.filter((p) => p.featured).sort((a, b) => a.order - b.order)
}

export function isImageSkin(p: Project): boolean {
  return p.type !== 'dev'
}

export function galleryFor(p: Project): string[] {
  return p.gallery ?? []
}
