import { describe, expect, it } from 'vitest'
import { SAMPLE_PROPERTIES } from '../data/properties'
import { buildReply, streamReply } from './mockApi'

const property = SAMPLE_PROPERTIES[0]

function args(prompt: string, attempt: number, signal = new AbortController().signal) {
  return { prompt, property, signal, attempt, delayMs: 0 }
}

async function collect(gen: AsyncGenerator<string>): Promise<string> {
  let text = ''
  for await (const chunk of gen) text += chunk
  return text
}

describe('streamReply: normal responses', () => {
  it('streams a reply that mentions the property', async () => {
    const text = await collect(streamReply(args('How much is the deposit?', 0)))
    expect(text).toContain(property.address)
    expect(text).toContain('deposit')
  })

  it('streams the deposit answer to the very end without cutting it off', async () => {
    const text = await collect(streamReply(args('How much is the deposit?', 0)))
    expect(text).toBe(buildReply('How much is the deposit?', property))
    expect(text.endsWith('before making a payment.')).toBe(true)
  })

  it.each([
    'Is the property available now?',
    'How much is the rent?',
    'Are pets allowed?',
    'Can I book a viewing?',
    'Who handles repairs?',
    'What is the address?',
    'What colour are the curtains?',
  ])('streams "%s" to completion', async (prompt) => {
    const text = await collect(streamReply(args(prompt, 0)))
    expect(text).toBe(buildReply(prompt, property))
  })
})

describe('streamReply: simulated error and retry', () => {
  it('streams part of the reply on the first attempt, then throws', async () => {
    const received: string[] = []
    const run = async () => {
      for await (const chunk of streamReply(args('simulate error', 0))) received.push(chunk)
    }
    await expect(run()).rejects.toThrow('Simulated network failure')
    const partial = received.join('')
    expect(partial.length).toBeGreaterThan(0)
    expect(partial).not.toBe(buildReply('simulate error', property, 1))
  })

  it('does not show a failure message in the first attempt text', async () => {
    const received: string[] = []
    try {
      for await (const chunk of streamReply(args('simulate error', 0))) received.push(chunk)
    } catch {
      // expected
    }
    expect(received.join('')).not.toContain("couldn't complete")
  })

  it('succeeds on retry with a success message, not a failure message', async () => {
    const text = await collect(streamReply(args('simulate error', 1)))
    expect(text).toBe(buildReply('simulate error', property, 1))
    expect(text).not.toContain("couldn't complete")
    expect(text).toContain('Retry worked')
  })
})

describe('streamReply: cancellation', () => {
  it('stops without throwing when aborted before starting', async () => {
    const controller = new AbortController()
    controller.abort()
    expect(await collect(streamReply(args('hello', 0, controller.signal)))).toBe('')
  })

  it('stops part way through when aborted mid-stream, without throwing', async () => {
    const controller = new AbortController()
    const received: string[] = []
    for await (const chunk of streamReply(args('How much is the deposit?', 0, controller.signal))) {
      received.push(chunk)
      if (received.length === 3) controller.abort()
    }
    const full = buildReply('How much is the deposit?', property)
    expect(received.join('').length).toBeGreaterThan(0)
    expect(received.join('').length).toBeLessThan(full.length)
  })
})

describe('buildReply', () => {
  it.each([
    ['Is the property available now?', 'is available now'],
    ['How much is the rent?', property.rent],
    ['How much is the deposit?', "five weeks' rent"],
    ['Are pets allowed?', 'case by case'],
    ['What is the address?', "The property you're enquiring about"],
    ['Who handles repairs?', 'repairs or maintenance'],
  ])('answers "%s"', (prompt, expected) => {
    expect(buildReply(prompt, property)).toContain(expected)
  })

  it('falls back to the list of topics for unknown questions', () => {
    expect(buildReply('What colour are the curtains?', property)).toContain('I can help with')
  })
})
