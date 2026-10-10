import type { ChatState, Conversation, Message, MessageStatus } from '../types'

export type ChatAction =
  | { type: 'new'; conversation: Conversation }
  | { type: 'select'; id: string }
  | { type: 'send'; conversationId: string; user: Message; assistant: Message }
  | { type: 'append'; conversationId: string; messageId: string; chunk: string }
  | { type: 'finish'; conversationId: string; messageId: string; status: MessageStatus }
  | { type: 'restart'; conversationId: string; messageId: string }

function updateMessage(
  state: ChatState,
  conversationId: string,
  messageId: string,
  update: (message: Message) => Message,
): ChatState {
  return {
    ...state,
    conversations: state.conversations.map((c) =>
      c.id !== conversationId
        ? c
        : {
            ...c,
            updatedAt: Date.now(),
            messages: c.messages.map((m) => (m.id === messageId ? update(m) : m)),
          },
    ),
  }
}

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'new':
      return {
        conversations: [action.conversation, ...state.conversations],
        activeId: action.conversation.id,
      }
    case 'select':
      return { ...state, activeId: action.id }
    case 'send':
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId
            ? {
                ...c,
                updatedAt: Date.now(),
                messages: [...c.messages, action.user, action.assistant],
              }
            : c,
        ),
      }
    case 'append':
      return updateMessage(state, action.conversationId, action.messageId, (m) => ({
        ...m,
        content: m.content + action.chunk,
      }))
    case 'finish':
      return updateMessage(state, action.conversationId, action.messageId, (m) => ({
        ...m,
        status: action.status,
      }))
    case 'restart':
      return updateMessage(state, action.conversationId, action.messageId, (m) => ({
        ...m,
        content: '',
        status: 'streaming',
      }))
  }
}
