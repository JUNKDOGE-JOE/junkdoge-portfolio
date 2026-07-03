import Image from 'next/image'
import type { Project } from '@/content/projects'

/** 影像作品皮肤：封面图放大模糊作底，暗角压边。 */
export function MediaImageSkin({ project }: { project: Project }) {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-[var(--night)]" data-testid="media-skin">
      <Image src={project.cover} alt="" fill priority sizes="100vw"
        className="object-cover opacity-80"
        style={{
          transform: 'translate(calc((var(--mx, 0.5) - 0.5) * -110px), calc((var(--my, 0.5) - 0.5) * -110px)) scale(1.32)',
          filter: 'blur(38px) saturate(1.5)',
          transition: 'transform 0.4s ease-out',
        }} />
      {/* Vignette + bottom anchor gradient (grounds the counter / circle UI) */}
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(70% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.6)), linear-gradient(to top, rgba(0,0,0,0.38), transparent 24%)' }} />
    </div>
  )
}
