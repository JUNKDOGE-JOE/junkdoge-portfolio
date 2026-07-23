import data from '@/content/site.json'

export interface SiteData {
  about: {
    bio: { zh: string; en: string }
    links: { label: string; href: string }[]
  }
  commission: {
    lead?: { zh: string; en: string }
    tiers: { k: string; kEn?: string; zh: string; en: string }[]
    contact: string
    channels: { label: string; value: string; href: string }[]
  }
  misc: {
    homeTagline: string
    bannerText: string
  }
  /** 马拉松准上线长页首屏；成片放 public/，建议 1080p + 合理码率 */
  showreel: {
    src: string
    poster: string
  }
}

// Source of truth is content/site.json — edit it via `npm run admin`.
export const site = data as SiteData
