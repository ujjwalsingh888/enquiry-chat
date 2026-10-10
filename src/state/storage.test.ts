import { beforeEach, describe, expect, it } from 'vitest'
import { SAMPLE_PROPERTIES } from '../data/properties'
import { buildReply } from '../lib/mockApi'
import { loadState } from './storage'

beforeEach(() => localStorage.clear())

describe('loadState', () => {
  it('marks a reply that was cut off mid-stream as failed, not complete', () => {
    localStorage.setItem(
      'enquiry-chat:v1',
      JSON.stringify({
        activeId: 'c1',
        conversations: [
          {
            id: 'c1',
            property: SAMPLE_PROPERTIES[0],
            updatedAt: 0,
            messages: [
              { id: 'u', role: 'user', content: 'deposit?', status: 'done', createdAt: 0 },
              { id: 'a', role: 'assistant', content: 'The listed tenancy', status: 'streaming', createdAt: 0 },
            ],
          },
        ],
      }),
    )
    const messages = loadState().conversations[0].messages
    expect(messages[1].status).toBe('error')
  })

  it('seeds the deposit conversation with the full, current deposit reply', () => {
    const marlow = loadState().conversations.find((c) => c.id === 'c-marlow')!
    expect(marlow.messages[1].content).toBe(
      buildReply('How much is the deposit?', SAMPLE_PROPERTIES[1]),
    )
  })
})
