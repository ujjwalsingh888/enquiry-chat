import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Message } from '../types'
import { MessageBubble } from './MessageBubble'

const base: Message = {
  id: 'a1',
  role: 'assistant',
  content: 'Looking up the latest details',
  status: 'done',
  createdAt: 0,
}

describe('MessageBubble', () => {
  it('shows a failed reply as failed and calls onRetry when Retry is clicked', async () => {
    const onRetry = vi.fn()
    render(<MessageBubble message={{ ...base, status: 'error' }} onRetry={onRetry} />)
    expect(screen.getByRole('alert')).toHaveTextContent('Reply failed')
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('does not show the failure notice on a completed reply', () => {
    render(<MessageBubble message={base} />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument()
  })

  it('shows the typing indicator while waiting for the first text', () => {
    render(<MessageBubble message={{ ...base, content: '', status: 'streaming' }} />)
    expect(screen.getByRole('status', { name: 'Assistant is typing' })).toBeInTheDocument()
  })
})
