import Image from 'next/image'
import type { Project } from '@/content/projects'

/** 影像作品皮肤：封面图放大模糊作底，暗角压边。 */
export function MediaImageSkin({ project }: { project: Project }) {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-[var(--night)]" data-testid="media-skin">
      <Image src={project.cover} alt="" fill priority sizes="100vw"
        className="scale-125 object-cover opacity-80 blur-2xl saturate-150" />
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(70% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.6))' }} />
    </div>
  )
}
