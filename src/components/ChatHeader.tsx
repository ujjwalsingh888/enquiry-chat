import type { Property } from '../types'
import { Plate } from './Plate'

interface ChatHeaderProps {
  property: Property
  menuOpen: boolean
  onMenu: () => void
}

export function ChatHeader({ property, menuOpen, onMenu }: ChatHeaderProps) {
  return (
    <header className="flex items-center gap-3 border-b border-line bg-paper px-4 py-3">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open enquiries"
        aria-expanded={menuOpen}
        aria-controls="sidebar"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-line hover:bg-mist md:hidden"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
        </svg>
      </button>
      <Plate number={property.number} />
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold">{property.address}</h1>
        <p className="text-sm text-ink/70">{property.rent}, available now</p>
      </div>
    </header>
  )
}
