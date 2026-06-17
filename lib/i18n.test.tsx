import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LangProvider, useLang } from '@/lib/i18n'

function Probe() {
  const { t, lang, toggle } = useLang()
  return (
    <div>
      <span data-testid="val">{t({ zh: '你好', en: 'hello' })}</span>
      <span data-testid="lang">{lang}</span>
      <button onClick={toggle}>toggle</button>
    </div>
  )
}

describe('i18n', () => {
  it('defaults to zh and toggles to en', async () => {
    render(<LangProvider><Probe /></LangProvider>)
    expect(screen.getByTestId('val').textContent).toBe('你好')
    await userEvent.click(screen.getByText('toggle'))
    expect(screen.getByTestId('lang').textContent).toBe('en')
    expect(screen.getByTestId('val').textContent).toBe('hello')
  })
})
