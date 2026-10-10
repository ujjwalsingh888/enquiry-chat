import { SUGGESTED_PROMPTS } from '../data/properties'

interface EmptyStateProps {
  address: string
  onPick: (prompt: string) => void
}

export function EmptyState({ address, onPick }: EmptyStateProps) {
  return (
    <div className="mx-auto flex h-full w-full max-w-xl flex-col justify-center px-4 py-8">
      <h2 className="text-2xl font-semibold tracking-tight text-balance">Ask about {address}</h2>
      <p className="mt-2 text-ink/70">
        Get answers on the deposit, viewings, pets and repairs. Replies in this demo are scripted.
      </p>
      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <li key={prompt}>
            <button
              type="button"
              onClick={() => onPick(prompt)}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-left font-medium hover:border-door hover:bg-mist"
            >
              {prompt}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
