import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Markdown } from './Markdown'

describe('Markdown', () => {
  it('shows raw HTML as text instead of running it', () => {
    const { container } = render(<Markdown>{'<script>alert(1)</script> hello'}</Markdown>)
    expect(container.querySelector('script')).toBeNull()
    expect(container).toHaveTextContent('<script>alert(1)</script>')
  })

  it('opens links safely in a new tab', () => {
    render(<Markdown>{'[Terms](https://example.com)'}</Markdown>)
    const link = screen.getByRole('link', { name: 'Terms' })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('drops javascript: links', () => {
    render(<Markdown>{'[Click](javascript:alert(1))'}</Markdown>)
    const link = screen.queryByRole('link')
    expect(link === null || !link.getAttribute('href')?.startsWith('javascript:')).toBe(true)
  })

  it('renders tables inside a scrollable wrapper', () => {
    const { container } = render(<Markdown>{'| A | B |\n| - | - |\n| 1 | 2 |'}</Markdown>)
    expect(container.querySelector('.md-table table')).not.toBeNull()
  })
})
