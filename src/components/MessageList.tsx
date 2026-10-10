import { useLayoutEffect, useRef, useState } from 'react'
import type { Message } from '../types'
import { MessageBubble } from './MessageBubble'

interface MessageListProps {
  messages: Message[]
  isStreaming: boolean
  onRetry: () => void
}

export function MessageList({ messages, isStreaming, onRetry }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const stickToBottom = useRef(true)
  const [showJump, setShowJump] = useState(false)

  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    stickToBottom.current = nearBottom
    setShowJump(!nearBottom)
  }

  // Follow new text only while the reader is at the bottom, so scrolling up to
  // re-read something is never interrupted by an incoming reply.
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight
  }, [messages])

  function jumpToLatest() {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        role="log"
        aria-label="Conversation"
        aria-busy={isStreaming}
        tabIndex={0}
        className="h-full overflow-y-auto px-4 py-5"
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              onRetry={
                message.status === 'error' && index === messages.length - 1 ? onRetry : undefined
              }
            />
          ))}
        </div>
      </div>
      {showJump && (
        <button
          type="button"
          onClick={jumpToLatest}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-door-deep px-4 py-1.5 text-sm font-semibold text-paper shadow-md hover:bg-door"
        >
          Jump to latest
        </button>
      )}
    </div>
  )
}
