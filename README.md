# Enquiry Chat

A responsive chat interface for a property lettings assistant, built with React, TypeScript, Vite and Tailwind CSS. Each conversation is tied to a property, and replies stream in word by word.

**Live demo:** _add your Netlify link here_

<!-- Add 2 screenshots: desktop and mobile -->

## Features

- Streaming replies with a **Stop** button and a typing indicator while waiting
- Loading, empty, error (with **Retry**) and success states
- Markdown replies (lists, tables, code) rendered safely: raw HTML is never executed and unsafe links are removed
- Conversation sidebar that becomes a slide-in drawer on mobile
- Auto-growing message box: Enter sends, Shift and Enter adds a new line
- Auto-scroll that stops following when you scroll up, with a **Jump to latest** button
- Conversations saved in `localStorage`
- Keyboard and screen reader support: skip link, visible focus, labelled controls, `role="log"` on the message list, reduced motion respected

## Try the error state

Send a message containing `simulate error`. The reply fails part way, then **Retry** succeeds.

## Run it

```bash
npm install
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm test` | Run unit and component tests (Vitest, React Testing Library) |
| `npm run lint` | Lint with oxlint |
| `npm run build` | Type-check and build for production |

## Connect a real backend

Replies are scripted by default. To stream from your own server, copy `.env.example` to `.env` and set `VITE_API_URL`. The endpoint receives `POST {"prompt", "propertyId"}` and must respond with Server-Sent Events, one JSON object per event:

```
data: {"text": "Hello "}

data: {"text": "there"}

data: [DONE]
```

## How it is built

- `src/state/chatReducer.ts`: a pure reducer holds all conversation state, so it is easy to test.
- `src/hooks/useChat.ts`: runs the streaming loop with an `AbortController` for Stop, and handles retry.
- `src/lib/api.ts`: one `streamReply` function that switches between the mock and a real SSE server, so components never change.
- `src/components/`: small components (`MessageBubble`, `MessageList`, `ChatInput`, `Sidebar` and so on). `MessageBubble` is memoised, and the reducer only replaces the message that changed, so a streaming reply does not re-render the rest of the history.
- Design tokens (colours, font) live in one `@theme` block in `src/index.css`.

## Deploy

Netlify: connect the repo. `netlify.toml` already sets the build command and publish directory. GitHub Actions (`.github/workflows/ci.yml`) runs lint, tests and build on every push and pull request.
