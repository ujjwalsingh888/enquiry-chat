import type { Conversation } from '../types'
import { Plate } from './Plate'

interface SidebarProps {
  conversations: Conversation[]
  activeId: string
  open: boolean
  inert: boolean
  onSelect: (id: string) => void
  onNew: () => void
  onClose: () => void
}

function preview(conversation: Conversation): string {
  const last = conversation.messages[conversation.messages.length - 1]
  if (!last) return 'No messages yet'
  return last.content.replace(/[*_`|#>-]/g, '').replace(/\s+/g, ' ').trim() || 'Reply in progress'
}

export function Sidebar({ conversations, activeId, open, inert, onSelect, onNew, onClose }: SidebarProps) {
  return (
    <aside
      id="sidebar"
      data-open={open}
      inert={inert}
      className="fixed inset-y-0 left-0 z-30 flex w-72 -translate-x-full flex-col bg-door-deep text-paper transition-transform duration-200 data-[open=true]:translate-x-0 md:static md:translate-x-0"
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <h2 className="text-lg font-semibold">Enquiries</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close enquiries"
          className="grid h-9 w-9 place-items-center rounded-md hover:bg-white/10 md:hidden"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={onNew}
          className="w-full rounded-lg bg-paper px-3 py-2 font-semibold text-door-deep hover:bg-white"
        >
          New enquiry
        </button>
      </div>
      <nav aria-label="Enquiries" className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        <ul className="space-y-1">
          {conversations.map((conversation) => {
            const isActive = conversation.id === activeId
            return (
              <li key={conversation.id}>
                <button
                  type="button"
                  onClick={() => onSelect(conversation.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left ${
                    isActive ? 'bg-white/15' : 'hover:bg-white/10'
                  }`}
                >
                  <Plate number={conversation.property.number} tone="dark" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">
                      {conversation.property.address}
                    </span>
                    <span className="block truncate text-sm text-paper/70">{preview(conversation)}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
