import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { streamReply } from '../lib/api'
import { buildReply, type StreamArgs } from '../lib/mockApi'
import { useChat } from './useChat'

const config = vi.hoisted(() => ({ delayMs: 0 }))

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual<typeof import('../lib/mockApi')>('../lib/mockApi')
  return {
    streamReply: vi.fn((args: StreamArgs) =>
      actual.streamReply({ ...args, delayMs: config.delayMs }),
    ),
  }
})

const attempts = () => vi.mocked(streamReply).mock.calls.map(([call]) => call.attempt)
const prompts = () => vi.mocked(streamReply).mock.calls.map(([call]) => call.prompt)

async function defaultImpl(args: StreamArgs) {
  const actual = await vi.importActual<typeof import('../lib/mockApi')>('../lib/mockApi')
  return actual.streamReply({ ...args, delayMs: config.delayMs })
}

function setup() {
  const view = renderHook(useChat)
  const messages = () => view.result.current.active.messages
  const last = () => messages()[messages().length - 1]
  return { ...view, messages, last }
}

beforeEach(() => {
  localStorage.clear()
  config.delayMs = 0
  vi.mocked(streamReply).mockReset()
  vi.mocked(streamReply).mockImplementation((args) => {
    // Wrap the real mock so every test goes through the real streaming code.
    return (async function* () {
      yield* await defaultImpl(args)
    })()
  })
})

describe('useChat: normal responses', () => {
  it('streams a deposit answer to completion and marks it done', async () => {
    const { result, last } = setup()
    const property = result.current.active.property
    act(() => result.current.send('How much is the deposit?'))
    await waitFor(() => expect(last().status).toBe('done'))
    expect(last().content).toBe(buildReply('How much is the deposit?', property))
    expect(last().content.endsWith('before making a payment.')).toBe(true)
    expect(result.current.isStreaming).toBe(false)
    expect(attempts()).toEqual([0])
  })
})

describe('useChat: failure and retry', () => {
  it('marks a failed reply as failed with partial text, then Retry resubmits with attempt 1', async () => {
    const { result, messages, last } = setup()
    const property = result.current.active.property

    act(() => result.current.send('simulate error'))
    await waitFor(() => expect(last().status).toBe('error'))

    // A failed reply is never presented as complete.
    expect(last().status).not.toBe('done')
    expect(last().content.length).toBeGreaterThan(0)
    expect(last().content).not.toBe(buildReply('simulate error', property, 1))
    expect(last().content).not.toContain("couldn't complete")
    expect(result.current.isStreaming).toBe(false)
    expect(attempts()).toEqual([0])

    await act(async () => result.current.retry())
    await waitFor(() => expect(last().status).toBe('done'))

    // The same prompt was resubmitted with the attempt number increased.
    expect(attempts()).toEqual([0, 1])
    expect(prompts()).toEqual(['simulate error', 'simulate error'])
    expect(messages()).toHaveLength(2)
    expect(last().content).toBe(buildReply('simulate error', property, 1))
    expect(last().content).toContain('Retry worked')
  })

  it('increases the attempt number on every retry, not just the first', async () => {
    vi.mocked(streamReply).mockImplementation(() =>
      (async function* () {
        yield 'partial '
        throw new Error('still failing')
      })(),
    )
    const { result, last } = setup()

    act(() => result.current.send('anything'))
    await waitFor(() => expect(last().status).toBe('error'))
    await act(async () => result.current.retry())
    await waitFor(() => expect(attempts()).toEqual([0, 1]))
    await waitFor(() => expect(last().status).toBe('error'))
    await act(async () => result.current.retry())
    await waitFor(() => expect(attempts()).toEqual([0, 1, 2]))
    await waitFor(() => expect(last().status).toBe('error'))
  })
})

describe('useChat: Stop', () => {
  it('cancels streaming, keeps the partial text, and still allows another message', async () => {
    config.delayMs = 5
    const { result, messages, last } = setup()
    const property = result.current.active.property

    act(() => result.current.send('How much is the deposit?'))
    await waitFor(() => expect(last().content.length).toBeGreaterThan(0))
    act(() => result.current.stop())
    await waitFor(() => expect(result.current.isStreaming).toBe(false))

    const stopped = last().content
    expect(last().status).toBe('done')
    expect(stopped.length).toBeLessThan(buildReply('How much is the deposit?', property).length)

    // Nothing more arrives after Stop.
    await new Promise((resolve) => setTimeout(resolve, 60))
    expect(last().content).toBe(stopped)

    // Sending again works and completes.
    act(() => result.current.send('Are pets allowed?'))
    await waitFor(() => expect(last().status).toBe('done'))
    expect(last().content).toBe(buildReply('Are pets allowed?', property))
    expect(messages()).toHaveLength(4)
    expect(messages()[1].content).toBe(stopped)
  })
})
