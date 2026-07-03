'use client'
import { useId } from 'react'

/**
 * Huge decorative outline text rendered as SVG.
 *
 * Plain stroked text (CSS text-stroke or SVG stroke) exposes the font's
 * internal contour overlaps as stray lines crossing the glyphs. This instead
 * dilates the glyph alpha and subtracts the original shape, leaving a clean
 * outer ring: overlaps merge away and edges stay vector-smooth.
 */
export function GhostOutline({
  text,
  color,
  fontSize = 88,
  viewBoxWidth = 200,
  outline = 0.55,
  className = '',
  style,
  ...rest
}: {
  text: string
  color: string
  fontSize?: number
  viewBoxWidth?: number
  outline?: number
  className?: string
  style?: React.CSSProperties
} & Record<string, unknown>) {
  const id = useId()
  return (
    <svg
      viewBox={`0 0 ${viewBoxWidth} 100`}
      className={className}
      // overflow visible: italic glyphs (and the dilated outline) lean past
      // the viewBox edge — default hidden overflow clips the last letter
      style={{ overflow: 'visible', ...style }}
      aria-hidden="true"
      {...rest}
    >
      <defs>
        <filter id={id} x="-30%" y="-30%" width="160%" height="160%">
          <feMorphology in="SourceAlpha" operator="dilate" radius={outline} result="dilated" />
          <feComposite in="dilated" in2="SourceAlpha" operator="out" result="ring" />
          <feFlood floodColor={color} result="paint" />
          <feComposite in="paint" in2="ring" operator="in" />
        </filter>
      </defs>
      <text
        x={viewBoxWidth / 2}
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fontStyle="italic"
        fontWeight={900}
        fontSize={fontSize}
        fill="#000"
        filter={`url(#${id})`}
      >
        {text}
      </text>
    </svg>
  )
}
