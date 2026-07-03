'use client'

/** Renders admin-authored copy with `\n` line breaks and blank-line paragraph gaps. */
export function MultilineCopy({ text, className = '' }: { text: string; className?: string }) {
  const blocks = text.split(/\n{2,}/).filter((b) => b.length > 0)
  if (blocks.length <= 1) {
    return <p className={`whitespace-pre-line ${className}`}>{text}</p>
  }
  return (
    <div className={`space-y-4 ${className}`}>
      {blocks.map((block, i) => (
        <p key={i} className="whitespace-pre-line">{block}</p>
      ))}
    </div>
  )
}
