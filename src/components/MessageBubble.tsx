import { memo } from 'react'
import type { Message } from '../types'
import { Markdown } from './Markdown'
import { TypingIndicator } from './TypingIndicator'

interface MessageBubbleProps {
  message: Message
  onRetry?: () => void
}

export const MessageBubble = memo(function MessageBubble({ message, onRetry }: MessageBubbleProps) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-2xl rounded-br-md bg-door px-4 py-2.5 break-words whitespace-pre-wrap text-paper">
          {message.content}
        </p>
      </div>
    )
  }

  const waiting = message.status === 'streaming' && !message.content
  const stoppedEmpty = message.status === 'done' && !message.content

  return (
    <div className="flex">
      <div className="max-w-full min-w-0 rounded-2xl rounded-bl-md border border-line bg-white px-4 py-2.5 sm:max-w-[42rem]">
        {waiting && <TypingIndicator />}
        {stoppedEmpty && <p className="text-ink/70 italic">Reply stopped before any text arrived.</p>}
        {message.content && <Markdown>{message.content}</Markdown>}
        {message.status === 'error' && (
          <div
            role="alert"
            className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-2 text-sm text-alert"
          >
            <span>Reply failed. Check your connection and try again.</span>
            <button
              type="button"
              onClick={onRetry}
              className="rounded-md border border-alert px-2.5 py-1 font-semibold hover:bg-alert hover:text-white"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  )
})
