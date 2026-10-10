import { SAMPLE_PROPERTIES } from '../data/properties'
import { buildReply } from '../lib/mockApi'
import type { ChatState, Conversation } from '../types'

const KEY = 'enquiry-chat:v1'

function seed(): ChatState {
  const now = Date.now()
  const conversations: Conversation[] = [
    { id: 'c-alder', property: SAMPLE_PROPERTIES[0], messages: [], updatedAt: now },
    {
      id: 'c-marlow',
      property: SAMPLE_PROPERTIES[1],
      updatedAt: now - 3_600_000,
      messages: [
        {
          id: 'm-1',
          role: 'user',
          content: 'How much is the deposit?',
          status: 'done',
          createdAt: now - 3_600_000,
        },
        {
          id: 'm-2',
          role: 'assistant',
          content: buildReply('How much is the deposit?', SAMPLE_PROPERTIES[1]),
          status: 'done',
          createdAt: now - 3_600_000,
        },
      ],
    },
    { id: 'c-kiln', property: SAMPLE_PROPERTIES[2], messages: [], updatedAt: now - 86_400_000 },
  ]
  return { conversations, activeId: conversations[0].id }
}

export function loadState(): ChatState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return seed()
    const parsed = JSON.parse(raw) as ChatState
    if (!Array.isArray(parsed.conversations) || parsed.conversations.length === 0) return seed()
    // A reply that was mid-stream when the tab closed or the page reloaded can
    // never finish. Mark it failed so it offers Retry instead of looking complete.
    return {
      activeId: parsed.activeId,
      conversations: parsed.conversations.map((c) => ({
        ...c,
        messages: c.messages.map((m) =>
          m.status === 'streaming' ? { ...m, status: 'error' as const } : m,
        ),
      })),
    }
  } catch {
    return seed()
  }
}

export function saveState(state: ChatState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Storage can be full or blocked. The app still works without it.
  }
}
