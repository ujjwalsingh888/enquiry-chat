import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ChatInput } from './ChatInput'

describe('ChatInput', () => {
  it('sends the trimmed text on Enter and clears the box', async () => {
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} onStop={vi.fn()} isStreaming={false} />)
    const box = screen.getByLabelText('Message')
    await userEvent.type(box, '  Are pets allowed?  {Enter}')
    expect(onSend).toHaveBeenCalledWith('Are pets allowed?')
    expect(box).toHaveValue('')
  })

  it('adds a new line on Shift+Enter instead of sending', async () => {
    const onSend = vi.fn()
    render(<ChatInput onSend={onSend} onStop={vi.fn()} isStreaming={false} />)
    const box = screen.getByLabelText('Message')
    await userEvent.type(box, 'one{Shift>}{Enter}{/Shift}two')
    expect(onSend).not.toHaveBeenCalled()
    expect(box).toHaveValue('one\ntwo')
  })

  it('disables Send while the box is empty', () => {
    render(<ChatInput onSend={vi.fn()} onStop={vi.fn()} isStreaming={false} />)
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled()
  })

  it('shows Stop instead of Send while streaming', async () => {
    const onStop = vi.fn()
    render(<ChatInput onSend={vi.fn()} onStop={onStop} isStreaming />)
    expect(screen.queryByRole('button', { name: 'Send' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Stop' }))
    expect(onStop).toHaveBeenCalled()
  })
})
