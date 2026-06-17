import styles from './LetterSwap.module.css'

/** Kinetic letter-swap text (pure CSS; framer-motion-free port of the reference effect). */
export function LetterSwap({ label, className = '' }: { label: string; className?: string }) {
  return (
    <span className={`${styles.letterswap} ${className}`}>
      <span className="sr-only">{label}</span>
      <span aria-hidden className={styles.row}>
        {label.split('').map((ch, i) => (
          <span className={styles.col} key={i} style={{ transitionDelay: `${(label.length - 1 - i) * 28}ms` }}>
            <span className={styles.a}>{ch === ' ' ? ' ' : ch}</span>
            <span className={styles.b}>{ch === ' ' ? ' ' : ch}</span>
          </span>
        ))}
      </span>
    </span>
  )
}
