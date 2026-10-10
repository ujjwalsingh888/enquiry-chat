import { useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'

interface ChatInputProps {
  onSend: (text: string) => void
  onStop: () => void
  isStreaming: boolean
}

const MAX_HEIGHT = 160

export function ChatInput({ onSend, onStop, isStreaming }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Grow with the content up to a limit, then scroll.
  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`
  }, [value])

  function submit() {
    const text = value.trim()
    if (!text || isStreaming) return
    onSend(text)
    setValue('')
    textareaRef.current?.focus()
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    submit()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // isComposing: don't send while an IME is still choosing characters.
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-line bg-paper px-4 pt-3 pb-4">
      <div className="mx-auto flex max-w-3xl items-end gap-2">
        <label htmlFor="message" className="sr-only">
          Message
        </label>
        <textarea
          id="message"
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your question"
          className="min-h-11 flex-1 resize-none rounded-xl border border-line bg-white px-4 py-2.5 placeholder:text-ink/50"
        />
        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            className="min-h-11 rounded-xl border border-door px-5 font-semibold text-door hover:bg-mist"
          >
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!value.trim()}
            className="min-h-11 rounded-xl bg-door px-5 font-semibold text-paper hover:bg-door-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        )}
      </div>
      <p className="mx-auto mt-2 hidden max-w-3xl text-xs text-ink/70 sm:block">
        Enter to send, Shift and Enter for a new line.
      </p>
    </form>
  )
}
