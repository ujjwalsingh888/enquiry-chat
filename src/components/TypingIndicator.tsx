export function TypingIndicator() {
  return (
    <span role="status" aria-label="Assistant is typing" className="inline-flex items-center gap-1 py-1.5">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </span>
  )
}
