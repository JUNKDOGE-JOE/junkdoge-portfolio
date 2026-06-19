import data from './projects.json'

export type ProjectType = 'pv' | 'vj' | 'collab' | 'dev'
export interface Localized { zh: string; en: string }
export interface ProjectLinks { bilibili?: string; github?: string; external?: string }
export interface Project {
  slug: string
  type: ProjectType
  featured: boolean
  order: number
  year: string
  title: Localized
  role: Localized
  desc: Localized
  cover: string            // path under /public, e.g. /covers/fusang.jpg
  devVisual?: string       // circle visual for dev projects
  accent?: string          // optional UI tint
  links: ProjectLinks
}

// Source of truth is content/projects.json — edit it via `npm run admin`.
export const projects: Project[] = data as Project[]
