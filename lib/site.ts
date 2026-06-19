import data from '@/content/site.json'

export interface SiteData {
  about: {
    bio: { zh: string; en: string }
    links: { label: string; href: string }[]
  }
  commission: {
    tiers: { k: string; zh: string; en: string }[]
    contact: string
  }
  misc: {
    homeTagline: string
    bannerText: string
  }
}

// Source of truth is content/site.json — edit it via `npm run admin`.
export const site = data as SiteData
