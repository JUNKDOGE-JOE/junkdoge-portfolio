import { CarouselRoot } from '@/components/CarouselRoot'
import { CornerFurniture } from '@/components/furniture/CornerFurniture'
import { MouseTrail } from '@/components/MouseTrail'
import { Preloader } from '@/components/Preloader'
import { getHomeProjects } from '@/lib/projects'

export default function Home() {
  const projects = getHomeProjects()
  return (
    <main>
      <Preloader />
      <CarouselRoot projects={projects} />
      <CornerFurniture />
      <MouseTrail images={projects.map((p) => p.cover)} />
    </main>
  )
}
