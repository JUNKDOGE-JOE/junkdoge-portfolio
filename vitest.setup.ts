import '@testing-library/jest-dom/vitest'

// jsdom doesn't implement matchMedia — stub it so hooks like useIsMobile work in tests.
// Defaults to matches:false (desktop); tests that need mobile can override window.matchMedia.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}
