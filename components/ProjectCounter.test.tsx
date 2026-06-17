import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProjectCounter } from './ProjectCounter'
import { LangProvider } from '@/lib/i18n'

describe('ProjectCounter', () => {
  it('shows padded number and fires callbacks', async () => {
    const onNext = vi.fn(); const onPrev = vi.fn()
    render(<LangProvider><ProjectCounter index={0} total={9} onPrev={onPrev} onNext={onNext} /></LangProvider>)
    expect(screen.getByText('01')).toBeInTheDocument()
    await userEvent.click(screen.getByLabelText('next'))
    expect(onNext).toHaveBeenCalledOnce()
  })
})
