export function LetterSwap({ label, className = '' }: { label: string; className?: string }) {
  return (
    <span className={`letterswap ${className}`}>
      <span className="sr-only">{label}</span>
      <span aria-hidden className="flex">
        {label.split('').map((ch, i) => (
          <span className="ls-col" key={i} style={{ transitionDelay: `${i * 28}ms` }}>
            <span className="ls-a">{ch === ' ' ? ' ' : ch}</span>
            <span className="ls-b">{ch === ' ' ? ' ' : ch}</span>
          </span>
        ))}
      </span>
    </span>
  )
}
