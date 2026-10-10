import { useEffect, useState } from 'react'
import { ChatHeader } from './components/ChatHeader'
import { ChatInput } from './components/ChatInput'
import { EmptyState } from './components/EmptyState'
import { MessageList } from './components/MessageList'
import { Sidebar } from './components/Sidebar'
import { useChat } from './hooks/useChat'
import { useMediaQuery } from './hooks/useMediaQuery'

export default function App() {
  const chat = useChat()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const drawerVisible = drawerOpen && !isDesktop

  useEffect(() => {
    if (!drawerVisible) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [drawerVisible])

  return (
    <div className="flex h-dvh overflow-hidden">
      <a
        href="#message"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-paper focus:px-3 focus:py-2"
      >
        Skip to message box
      </a>

      <Sidebar
        conversations={chat.conversations}
        activeId={chat.active.id}
        open={drawerVisible}
        inert={!isDesktop && !drawerOpen}
        onSelect={(id) => {
          chat.select(id)
          setDrawerOpen(false)
        }}
        onNew={() => {
          chat.newConversation()
          setDrawerOpen(false)
        }}
        onClose={() => setDrawerOpen(false)}
      />
      {drawerVisible && (
        <button
          type="button"
          aria-label="Close enquiries"
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-20 bg-ink/40 md:hidden"
        />
      )}

      <main className="flex min-w-0 flex-1 flex-col">
        <ChatHeader
          property={chat.active.property}
          menuOpen={drawerVisible}
          onMenu={() => setDrawerOpen(true)}
        />
        {chat.active.messages.length === 0 ? (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <EmptyState address={chat.active.property.address} onPick={chat.send} />
          </div>
        ) : (
          <MessageList
            key={chat.active.id}
            messages={chat.active.messages}
            isStreaming={chat.isStreaming}
            onRetry={chat.retry}
          />
        )}
        <ChatInput onSend={chat.send} onStop={chat.stop} isStreaming={chat.isStreaming} />
      </main>
    </div>
  )
}
