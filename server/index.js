require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');

const { saveMemory, queryMemory, listRecentMemories } = require('./parcle');
const { runAgent } = require('./agent');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Global Middleware ────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Request logger: prints METHOD + route + timestamp for every request
app.use((req, _res, next) => {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${req.method} ${req.path}`);
  next();
});

// ── GET /api/health ──────────────────────────────────────────
// Returns server health status + current timestamp
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── POST /api/agent ──────────────────────────────────────────
// Body: { task: string }
// Runs the full agent loop and returns the AI response
app.post('/api/agent', async (req, res) => {
  const { task } = req.body;
  if (!task) {
    return res.status(400).json({ error: 'task is required' });
  }
  try {
    const result = await runAgent(task);
    res.json({
      response: result.response,
      retrievedMemories: result.retrievedMemories ?? [],
      memoriesSaved: true,
    });
  } catch (err) {
    console.error('[Server] POST /api/agent error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/memories ────────────────────────────────────────
// Returns the 10 most recent Parcle memories
app.get('/api/memories', async (_req, res) => {
  try {
    const memories = await listRecentMemories(10);
    res.json({ memories });
  } catch (err) {
    console.error('[Server] GET /api/memories error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/memory ─────────────────────────────────────────
// Body: { title, content, tags }
// Manually saves a memory to Parcle
app.post('/api/memory', async (req, res) => {
  const { title, content, tags = [] } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required' });
  }
  try {
    const sessionId = await saveMemory(title, content, tags);
    if (!sessionId) {
      return res.status(502).json({ error: 'Failed to save memory to Parcle' });
    }
    res.json({ success: true, session_id: sessionId });
  } catch (err) {
    console.error('[Server] POST /api/memory error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/memories/search ────────────────────────────────
// Body: { query: string }
// Semantic search over Parcle — returns up to 5 result cards
app.post('/api/memories/search', async (req, res) => {
  const { query } = req.body;
  if (!query || !query.trim()) {
    return res.status(400).json({ error: 'query is required' });
  }
  try {
    const raw = await queryMemory(query.trim());
    // Shape each result into a sidebar-card-friendly object
    const results = raw.map((m, i) => ({
      id: `search-${i}`,
      title: m.answer
        ? m.answer.split('\n')[0].replace(/^#+\s*/, '').trim().slice(0, 90) || `Result ${i + 1}`
        : `Result ${i + 1}`,
      content: m.answer ?? '',
      confidence: Math.round((m.confidence ?? 0) * 100),
      citationIds: (m.citations ?? []).map(c => c.id ?? c.session_id ?? String(c)).filter(Boolean),
      tag: { type: 'search result' },
    }));
    res.json({ results, total: results.length });
  } catch (err) {
    console.error('[Server] POST /api/memories/search error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Legacy routes (kept for backward compatibility) ──────────

// POST /api/agent/run  (old route — proxies to the new agent logic)
app.post('/api/agent/run', async (req, res) => {
  const { task } = req.body;
  if (!task) {
    return res.status(400).json({ error: 'task is required' });
  }
  try {
    const result = await runAgent(task);
    res.json({ ok: true, ...result });
  } catch (err) {
    console.error('[Server] POST /api/agent/run error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/memory/save  (old route)
app.post('/api/memory/save', async (req, res) => {
  const { title, content, tags = [] } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required' });
  }
  const sessionId = await saveMemory(title, content, tags);
  if (!sessionId) {
    return res.status(502).json({ error: 'Failed to save memory to Parcle' });
  }
  res.json({ ok: true, session_id: sessionId });
});

// POST /api/memory/query  (old route)
app.post('/api/memory/query', async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'query is required' });
  }
  const results = await queryMemory(query);
  res.json({ ok: true, results });
});

// GET /api/memory/recent  (old route)
app.get('/api/memory/recent', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
  const memories = await listRecentMemories(limit);
  res.json({ ok: true, memories });
});

// ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚀 Server listening on http://localhost:${PORT}`);
  console.log(`   New routes:`);
  console.log(`     POST /api/agent      → run the AI agent`);
  console.log(`     GET  /api/memories   → list recent memories`);
  console.log(`     POST /api/memory     → save a memory manually`);
  console.log(`     GET  /api/health     → server health check`);
  console.log(`   Legacy routes still active at /api/agent/run, /api/memory/*`);
});
