import { streamReply as streamMock, type StreamArgs } from './mockApi'

const API_URL = import.meta.env.VITE_API_URL as string | undefined

/**
 * Entry point used by the app. If VITE_API_URL is set the reply is streamed
 * from that server, otherwise the scripted mock is used.
 */
export function streamReply(args: StreamArgs): AsyncGenerator<string> {
  return API_URL ? streamFromServer(API_URL, args) : streamMock(args)
}

/**
 * Expects Server-Sent Events where each `data:` line is JSON: {"text": "..."}.
 * A `data: [DONE]` event ends the stream.
 */
async function* streamFromServer(
  url: string,
  { prompt, property, signal }: StreamArgs,
): AsyncGenerator<string> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({ prompt, propertyId: property.id }),
    signal,
  })
  if (!res.ok || !res.body) throw new Error(`Request failed (${res.status})`)

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = ''
  while (true) {
    const { value, done } = await reader.read()
    if (done) return
    buffer += value
    const events = buffer.split('\n\n')
    buffer = events.pop() ?? ''
    for (const event of events) {
      for (const line of event.split('\n')) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6)
        if (data === '[DONE]') return
        try {
          const text = (JSON.parse(data) as { text?: string }).text
          if (text) yield text
        } catch {
          // Ignore malformed events instead of breaking the whole stream.
        }
      }
    }
  }
}
