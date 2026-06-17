import Image from 'next/image'

export function CircleCrop({ src, alt, size = 150 }: { src: string; alt: string; size?: number }) {
  return (
    <div
      className="group relative overflow-hidden rounded-full border border-white/40"
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="150px"
        className="object-cover transition-transform duration-[400ms] ease-in-out group-hover:scale-110"
      />
    </div>
  )
}
