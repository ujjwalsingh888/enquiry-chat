import { describe, expect, it } from 'vitest'
import { SAMPLE_PROPERTIES } from '../data/properties'
import type { ChatState, Message } from '../types'
import { chatReducer } from './chatReducer'

const user: Message = { id: 'u1', role: 'user', content: 'Hi', status: 'done', createdAt: 0 }
const assistant: Message = { id: 'a1', role: 'assistant', content: '', status: 'streaming', createdAt: 0 }

const initial: ChatState = {
  activeId: 'c1',
  conversations: [{ id: 'c1', property: SAMPLE_PROPERTIES[0], messages: [], updatedAt: 0 }],
}

describe('chatReducer', () => {
  it('adds the user message and a streaming assistant message on send', () => {
    const next = chatReducer(initial, { type: 'send', conversationId: 'c1', user, assistant })
    expect(next.conversations[0].messages).toHaveLength(2)
    expect(next.conversations[0].messages[1].status).toBe('streaming')
  })

  it('appends chunks to the right message and finishes it', () => {
    let state = chatReducer(initial, { type: 'send', conversationId: 'c1', user, assistant })
    state = chatReducer(state, { type: 'append', conversationId: 'c1', messageId: 'a1', chunk: 'Hello ' })
    state = chatReducer(state, { type: 'append', conversationId: 'c1', messageId: 'a1', chunk: 'there' })
    state = chatReducer(state, { type: 'finish', conversationId: 'c1', messageId: 'a1', status: 'done' })
    const message = state.conversations[0].messages[1]
    expect(message.content).toBe('Hello there')
    expect(message.status).toBe('done')
  })

  it('clears a failed message when restarting it', () => {
    let state = chatReducer(initial, { type: 'send', conversationId: 'c1', user, assistant })
    state = chatReducer(state, { type: 'append', conversationId: 'c1', messageId: 'a1', chunk: 'Partial' })
    state = chatReducer(state, { type: 'finish', conversationId: 'c1', messageId: 'a1', status: 'error' })
    state = chatReducer(state, { type: 'restart', conversationId: 'c1', messageId: 'a1' })
    expect(state.conversations[0].messages[1]).toMatchObject({ content: '', status: 'streaming' })
  })

  it('makes a new conversation the active one', () => {
    const next = chatReducer(initial, {
      type: 'new',
      conversation: { id: 'c2', property: SAMPLE_PROPERTIES[1], messages: [], updatedAt: 1 },
    })
    expect(next.activeId).toBe('c2')
    expect(next.conversations).toHaveLength(2)
  })
})
