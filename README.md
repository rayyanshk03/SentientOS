<img width="2940" height="1664" alt="image" src="https://github.com/user-attachments/assets/7ce2d3f0-d300-4019-802b-5e1027a5fd3a" /># SentientOS — Eternal Architect

> An AI-powered system orchestrator that remembers every decision it makes.

Ask architectural questions, get structured implementation plans, and watch every decision get automatically stored in persistent memory — so the agent never starts from zero.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│                                                             │
│   ┌─────────────────────┐   ┌──────────────────────────┐   │
│   │   Memory Sidebar    │   │     Agent Chat (70%)     │   │
│   │   (Past Decisions)  │   │                          │   │
│   │                     │   │  User msg  ──────────►  │   │
│   │  ┌───────────────┐  │   │  ◄────────  Agent reply │   │
│   │  │ MemoryCard    │  │   │                          │   │
│   │  │ MemoryCard    │  │   │  📎 N memories used      │   │
│   │  └───────────────┘  │   │     └── confidence bars  │   │
│   └─────────────────────┘   └──────────────────────────┘   │
│          React + Vite + Tailwind CSS (localhost:5173)        │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP / Vite proxy
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express API Server                       │
│                      (localhost:3001)                       │
│                                                             │
│   POST /api/agent      ──► agent.js                        │
│   GET  /api/memories   ──► parcle.js → listRecentMemories  │
│   POST /api/memory     ──► parcle.js → saveMemory          │
│   GET  /api/health                                          │
└──────────────┬──────────────────────────┬───────────────────┘
               │                          │
               ▼                          ▼
   ┌───────────────────┐      ┌───────────────────────┐
   │   Google Gemini   │      │     Parcle Memory     │
   │  (gemini-2.5-     │      │      (parcle.ai)      │
   │   flash)          │      │                       │
   │                   │      │  saveMemory()         │
   │  generateContent  │      │  queryMemory()        │
   │  (context-aware   │      │  listRecentMemories() │
   │   prompt with     │      │                       │
   │   past decisions) │      │  SSE search stream    │
   └───────────────────┘      └───────────────────────┘
```

---

## Setup

### Prerequisites

- Node.js 18+
- A [Gemini API key](https://aistudio.google.com/app/apikey)
- A [Parcle API key](https://parcle.ai)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/SentientOS.git
cd SentientOS
```

### 2. Configure environment variables

Copy the example file and fill in your keys:

```bash
cp .env.example .env
```

Edit `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PARCLE_API_KEY=your_parcle_api_key_here
ENTER_PROJECT_ID=eternal-architect
PORT=3001
```

### 3. Install dependencies

```bash
# Root + server deps
npm install

# Client deps
cd client && npm install && cd ..
```

### 4. Seed initial project memories

Run this once to give the agent its foundational knowledge:

```bash
node server/seedMemories.js
```

Expected output:
```
╔══════════════════════════════════════════════╗
║       SentientOS — Parcle Memory Seeder      ║
╚══════════════════════════════════════════════╝

[1/6] "Frontend Stack Decision" … ✅  saved  (session_id: sess_...)
[2/6] "Backend Stack Decision"  … ✅  saved  (session_id: sess_...)
[3/6] "API Design Pattern"      … ✅  saved  (session_id: sess_...)
[4/6] "Memory Strategy"         … ✅  saved  (session_id: sess_...)
[5/6] "Styling Rules"           … ✅  saved  (session_id: sess_...)
[6/6] "Error Handling Rule"     … ✅  saved  (session_id: sess_...)

  Done.  ✅ 6 seeded   ❌ 0 failed
```

### 5. Start the development servers

```bash
npm run dev
```

This starts both concurrently:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

---

## API Reference

### `POST /api/agent` — Run the AI agent

Sends a task to the Eternal Architect. The agent queries Parcle for relevant past decisions, builds a context-aware prompt, calls Gemini, saves the new decision, and returns everything.

```bash
curl -X POST http://localhost:3001/api/agent \
  -H "Content-Type: application/json" \
  -d '{"task": "What database technology should SentientOS use?"}'
```

**Response:**

```json
{
  "response": "Based on past decisions for SentientOS, we will use PostgreSQL...",
  "retrievedMemories": [
    {
      "title": "SentientOS should use PostgreSQL as its primary datastore",
      "confidence": 78,
      "citationIds": ["sess_zABslXD...", "sess_o14M7s..."]
    }
  ],
  "memoriesSaved": true
}
```

### `GET /api/memories` — List recent memories

```bash
curl http://localhost:3001/api/memories
```

### `POST /api/memory` — Save a memory manually

```bash
curl -X POST http://localhost:3001/api/memory \
  -H "Content-Type: application/json" \
  -d '{"title": "My Decision", "content": "We chose X because Y.", "tags": ["decision"]}'
```

### `GET /api/health`

```bash
curl http://localhost:3001/api/health
# {"status":"ok","timestamp":"2026-06-21T..."}
```

---

## How Parcle Memory Works

Parcle is the long-term memory layer that makes the agent context-aware across sessions. Three functions power the entire memory system:

### `saveMemory(title, content, tags[])`

Called automatically after every agent response. Stores the decision as a two-turn dialog in Parcle so it's semantically searchable:

```
user:      "[Memory] What database should SentientOS use?"
assistant: "PostgreSQL, because..."
```

Tags like `type:decision`, `project:eternal-architect`, and `date:YYYY-MM-DD` are attached for filtering.

### `queryMemory(naturalLanguageQuery)`

Called at the start of every agent run. Searches Parcle via SSE stream using the user's task as the query. Returns up to 5 result objects each with:
- `answer` — the retrieved memory content
- `confidence` — 0.0–1.0 match score
- `citations` — source session IDs

The top results are injected into the system prompt so Gemini never contradicts past decisions.

### `listRecentMemories(limit = 10)`

Used by the sidebar to display the 10 most recent stored decisions, sorted newest-first. Calls `/v1/memories/sources` on the Parcle API.

---
## Project Structure

```
SentientOS/
├── .env                      # API keys (not committed)
├── package.json              # Root: concurrently runs both servers
│
├── server/
│   ├── index.js              # Express API server (port 3001)
│   ├── agent.js              # Core agent loop: query → prompt → Gemini → save
│   ├── parcle.js             # Parcle memory API helpers
│   └── seedMemories.js       # One-time knowledge seeder
│
└── client/
    ├── vite.config.js        # Vite + /api proxy to port 3001
    └── src/
        ├── main.jsx
        ├── index.css         # Design tokens, animations, mobile CSS
        └── App.jsx           # Two-panel UI: sidebar + chat
```

---


| Desktop | 
|---------|
| ![Desktop UI](<img width="2940" height="1664" alt="image" src="https://github.com/user-attachments/assets/e67729fb-c3b1-4f46-b0bb-fc4ce7fdf062" />
) |

---

## License

MIT — see [LICENSE](./LICENSE)
