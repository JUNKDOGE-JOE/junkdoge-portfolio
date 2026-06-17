import type { Project } from '@/content/projects'

/** dev 项目皮肤：暖白底 + 柔和渐变。 */
export function DevSkin(_props: { project: Project }) {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-[var(--bone)]" data-testid="dev-skin">
      <div className="absolute -inset-1/3"
        style={{ background: 'radial-gradient(32% 40% at 30% 30%, #ffd1bd, transparent 62%), radial-gradient(34% 42% at 72% 42%, #ffc0d6, transparent 62%), radial-gradient(40% 50% at 50% 84%, #f6b6a4, transparent 62%)', filter: 'blur(38px)' }} />
    </div>
  )
}
