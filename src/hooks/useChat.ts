import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { SAMPLE_PROPERTIES } from '../data/properties'
import { streamReply } from '../lib/api'
import { uid } from '../lib/id'
import { chatReducer } from '../state/chatReducer'
import { loadState, saveState } from '../state/storage'
import type { Conversation, Message, Property } from '../types'

export function useChat() {
  const [state, dispatch] = useReducer(chatReducer, undefined, loadState)
  const abortRef = useRef<AbortController | null>(null)
  // How many times each assistant message has been retried.
  const retriesRef = useRef(new Map<string, number>())

  useEffect(() => saveState(state), [state])
  useEffect(() => () => abortRef.current?.abort(), [])

  const active = useMemo(
    () => state.conversations.find((c) => c.id === state.activeId) ?? state.conversations[0],
    [state],
  )
  const lastMessage = active.messages[active.messages.length - 1]
  const isStreaming = lastMessage?.status === 'streaming'

  const run = useCallback(
    async (
      conversationId: string,
      messageId: string,
      prompt: string,
      property: Property,
      attempt: number,
    ) => {
      const controller = new AbortController()
      abortRef.current = controller
      try {
        for await (const chunk of streamReply({
          prompt,
          property,
          signal: controller.signal,
          attempt,
        })) {
          dispatch({ type: 'append', conversationId, messageId, chunk })
        }
        dispatch({ type: 'finish', conversationId, messageId, status: 'done' })
      } catch {
        dispatch({
          type: 'finish',
          conversationId,
          messageId,
          status: controller.signal.aborted ? 'done' : 'error',
        })
      }
    },
    [],
  )

  const stop = useCallback(() => abortRef.current?.abort(), [])

  const send = useCallback(
    (text: string) => {
      // One reply at a time: a second run would replace the controller that Stop uses.
      if (isStreaming) return
      const now = Date.now()
      const user: Message = { id: uid(), role: 'user', content: text, status: 'done', createdAt: now }
      const assistant: Message = {
        id: uid(),
        role: 'assistant',
        content: '',
        status: 'streaming',
        createdAt: now,
      }
      dispatch({ type: 'send', conversationId: active.id, user, assistant })
      void run(active.id, assistant.id, text, active.property, 0)
    },
    [active.id, active.property, isStreaming, run],
  )

  const retry = useCallback(() => {
    const failedIndex = active.messages.findLastIndex((m) => m.status === 'error')
    const failed = active.messages[failedIndex]
    const prompt = active.messages[failedIndex - 1]
    if (isStreaming || !failed || !prompt) return
    const attempt = (retriesRef.current.get(failed.id) ?? 0) + 1
    retriesRef.current.set(failed.id, attempt)
    dispatch({ type: 'restart', conversationId: active.id, messageId: failed.id })
    void run(active.id, failed.id, prompt.content, active.property, attempt)
  }, [active, isStreaming, run])

  const select = useCallback(
    (id: string) => {
      stop()
      dispatch({ type: 'select', id })
    },
    [stop],
  )

  const newConversation = useCallback(() => {
    stop()
    const property = SAMPLE_PROPERTIES[state.conversations.length % SAMPLE_PROPERTIES.length]
    const conversation: Conversation = {
      id: uid(),
      property,
      messages: [],
      updatedAt: Date.now(),
    }
    dispatch({ type: 'new', conversation })
  }, [state.conversations.length, stop])

  const conversations = useMemo(
    () => [...state.conversations].sort((a, b) => b.updatedAt - a.updatedAt),
    [state.conversations],
  )

  return { conversations, active, isStreaming, send, stop, retry, select, newConversation }
}
