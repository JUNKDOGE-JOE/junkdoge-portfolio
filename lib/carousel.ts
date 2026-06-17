export function nextIndex(current: number, length: number): number {
  return length === 0 ? 0 : (current + 1) % length
}
export function prevIndex(current: number, length: number): number {
  return length === 0 ? 0 : (current - 1 + length) % length
}
