# Mistral Chat

A minimal, production-ready full-stack chat app using the official [Mistral AI TypeScript SDK](https://github.com/mistralai/client-ts) (`@mistralai/mistralai`), React, TypeScript, Tailwind CSS, and Express — with **streaming responses**.

## Features

- Chat bubble UI (user / assistant), send button, auto-scroll, typing indicator
- Server-side streaming via the SDK's `mistral.chat.stream()` → SSE to the client
- Model hard-coded to `mistral-small-latest`
- API key stays on the server (`process.env.MISTRAL_API_KEY`), never sent to the browser

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure your API key (get one at https://console.mistral.ai/api-keys)
cp .env.example .env
# then edit .env:
# MISTRAL_API_KEY=your_key_here

# 3. Run in development (Express API on :3001 + Vite dev server on :5173)
npm run dev
```

Open http://localhost:5173.

## Production

```bash
npm run build   # builds client to client/dist
npm start       # Express serves the API + built frontend on http://localhost:3001
```

## Folder structure

```
mistral-chat/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
├── server/
│   └── index.js          # Express API — Mistral SDK lives here (key never reaches client)
└── client/
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── Chat.tsx       # chat UI, streaming fetch reader, auto-scroll
        └── index.css      # Tailwind CSS v4 entry
```

## How it works

- The client sends the full conversation to `POST /api/chat` as `{ messages: [{role, content}, ...] }`.
- The server calls `mistral.chat.stream({ model: 'mistral-small-latest', messages })` and forwards each token delta to the client as an SSE event.
- The client reads the stream with `fetch` + `ReadableStream` and renders tokens as they arrive.
