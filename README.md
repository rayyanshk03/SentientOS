<img width="2940" height="1664" alt="image" src="https://github.com/user-attachments/assets/7ce2d3f0-d300-4019-802b-5e1027a5fd3a" /># SentientOS — Eternal Architect

> An AI-powered system orchestrator that remembers every decision it makes.

SentientOS is an intelligent platform designed to act as your team's autonomous technical lead. Ask architectural questions, ingest real-world webhooks, upload complex documentation, and watch every decision get automatically stored in a persistent memory vault—so the agent never starts from zero.

---

## 🚀 Core Features

- **Autonomous Agent Chat**: Chat with a Gemini-powered AI that dynamically queries past decisions using semantic search.
- **Parcle Memory Vault**: All decisions, bugs, and knowledge are embedded into a vector database (Parcle AI) for instant, context-aware retrieval.
- **Automated Webhook Ingestion**: Simulate or receive real-world incoming webhooks (GitHub, Jira, Datadog, Slack) and let the AI autonomously run root-cause analysis and suggest resolutions.
- **Documents Library (RAG)**: Drag and drop `.pdf`, `.docx`, or `.txt` files. SentientOS automatically chunks and embeds the text, allowing the AI to answer questions directly from your documentation.
- **Daily Standup Summarizer**: The AI automatically reads all system logs, events, and memories to generate a daily standup report of what happened across your engineering organization.
- **ADR & Bug Tracking**: Auto-generates Architecture Decision Records (ADRs) and actively tracks system bugs based on ingestion pipelines.

---

## 🏗️ Architecture Stack

**Frontend (Client)**:
- React + Vite
- React Router DOM
- Global Light/Dark Theme System (Glassmorphic Design)
- Recharts for Real-Time Analytics Dashboard

**Backend (Server)**:
- Python FastAPI (Port 3002)
- MongoDB Atlas (Persistent Storage for Users, Uploads, Agent Logs)
- Parcle AI Vector Database (Long-Term Semantic Memory)
- Google Gemini SDK (`google-genai` / `gemini-2.5-flash`)
- `pypdf` & `python-docx` for Document Ingestion

---

## ⚙️ Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- A [Gemini API key](https://aistudio.google.com/app/apikey)
- A [Parcle API key](https://parcle.ai)
- A [MongoDB Atlas URI](https://www.mongodb.com/)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/SentientOS.git
cd SentientOS
```

### 2. Configure environment variables

Create a `.env` file in the root directory. You must define your MongoDB connection string (`MONGODB_URI`) so the backend can securely connect to your database cluster:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PARCLE_API_KEY=your_parcle_api_key_here
MONGODB_URI=your_mongodb_cluster_uri_here
ENTER_PROJECT_ID=eternal-architect
PORT=3002
```

---

## 🗄️ MongoDB Database Integration

SentientOS relies on **MongoDB** as its primary operational database. It uses a secure connection string to connect to your cluster.

- **Connection String**: The connection is established via the `MONGODB_URI` environment variable, which is safely read from your `.env` file.
- **Persistent Storage**: MongoDB is used to permanently store:
  - Agent and chat logs
  - Ingested Webhook events and simulations
  - User and project metadata
  - Analytics and performance tracking metrics

When the backend starts, it automatically connects to your MongoDB cluster and verifies the connection using the provided `MONGODB_URI`.

---

### 3. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn agent:app --reload --port 3002
```

### 4. Install Frontend Dependencies

```bash
# In a new terminal window
cd client
npm install
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3002

---

## 🧠 How Parcle Memory Works

Parcle is the long-term memory layer that makes the agent context-aware across sessions.

1. **`save_memory(title, content, tags)`**
   Called automatically after every agent response, document upload, or webhook resolution. Stores the data in Parcle so it's semantically searchable.
2. **`queryMemory(naturalLanguageQuery)`**
   Called at the start of every agent run. Searches Parcle via SSE stream using the user's task as the query. The top results are injected into the system prompt so Gemini never contradicts past decisions.

---

## 🤖 Built with Vibe Coding on Enter Pro

This entire application was built completely through **Vibe Coding** on **Enter Pro**. 

Without writing a single line of code manually, the following was orchestrated purely through natural language instructions:

- Scaffolded the entire Python/FastAPI backend and React frontend from scratch.
- Integrated MongoDB, Parcle AI, and Google Gemini into a seamless RAG architecture.
- Built the automated Webhook Simulator and Operations Center analytics dashboard.
- Implemented document parsing (`.pdf`, `.docx`) and chunking directly into vector storage.
- Designed the Apple-inspired UI design system with a global light/dark theme switch.

The entire backend + frontend was brought to life via Vibe Coding, with **Enter Pro** proposing, implementing, and verifying each step end-to-end.

| Desktop | 
|---------|
| ![Desktop UI](<img width="2940" height="1664" alt="image" src="https://github.com/user-attachments/assets/e67729fb-c3b1-4f46-b0bb-fc4ce7fdf062" />) |

---

## License

MIT — see [LICENSE](./LICENSE)
