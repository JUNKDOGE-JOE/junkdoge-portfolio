'use client'
import { AnimatePresence, motion } from 'framer-motion'
import type { Project } from '@/content/projects'
import { isImageSkin } from '@/lib/projects'
import { MediaImageSkin } from './skins/MediaImageSkin'
import { DevSkin } from './skins/DevSkin'

export function SlideBackground({ project }: { project: Project }) {
  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={project.slug}
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
      >
        {isImageSkin(project) ? (
          <MediaImageSkin project={project} />
        ) : (
          <DevSkin project={project} />
        )}
      </motion.div>
    </AnimatePresence>
  )
}
