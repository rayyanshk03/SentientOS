/**
 * parcle.js — Parcle Memory API helper
 * Base URL: https://api.parcle.ai
 * Docs:     https://docs.parcle.ai/api/memory-api.html
 *
 * All three functions handle errors gracefully:
 *   - saveMemory   → returns the Parcle session_id, or null on failure
 *   - queryMemory  → returns top-5 result objects, or [] on failure
 *   - listRecentMemories → returns sources sorted newest-first, or [] on failure
 */

require('dotenv').config({ path: '../.env' });
const axios = require('axios');

const BASE_URL = 'https://api.parcle.ai';

// The user_id scopes all memory under a single namespace for this project.
// You can make this dynamic per-user if needed later.
const DEFAULT_USER_ID = process.env.ENTER_PROJECT_ID || 'eternal-architect';

/**
 * Returns an Axios instance pre-configured with the Parcle auth header.
 * Throws clearly if the API key is missing.
 */
function createClient() {
  const apiKey = process.env.PARCLE_API_KEY;
  if (!apiKey) {
    throw new Error('PARCLE_API_KEY is not set in environment variables.');
  }
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    timeout: 30_000,
  });
}

/**
 * Ensures the user namespace exists in Parcle before writing to it.
 * This is idempotent — calling it on an existing user is safe.
 */
async function ensureUser(client, userId) {
  try {
    await client.post('/v1/users', {
      user_id: userId,
      name: 'Eternal Architect Agent',
      timezone: 'UTC',
    });
  } catch (err) {
    // 409 / already exists is fine; surface real errors
    if (err?.response?.status !== 409) {
      console.warn('[Parcle] ensureUser warning:', err?.response?.data || err.message);
    }
  }
}

// ─────────────────────────────────────────────────────────────
// 1. saveMemory(title, content, tags[])
//    Stores a decision, bugfix, or feature note in Parcle memory.
//    Uses ingest_dialog so it's immediately searchable.
// ─────────────────────────────────────────────────────────────
async function saveMemory(title, content, tags = []) {
  const timestamp = new Date().toISOString();
  const projectName = process.env.ENTER_PROJECT_ID || 'eternal-architect';

  console.log(`[Parcle] 💾 saveMemory → title="${title}" tags=${JSON.stringify(tags)}`);

  try {
    const client = createClient();
    const userId = DEFAULT_USER_ID;

    await ensureUser(client, userId);

    // Build a tag object from the tags array + required fields
    const tagObject = {
      project: projectName,
      timestamp,
    };
    tags.forEach((t) => {
      // Accept "key:value" pairs or plain strings stored as labels
      if (typeof t === 'string' && t.includes(':')) {
        const [k, ...rest] = t.split(':');
        tagObject[k.trim()] = rest.join(':').trim();
      } else if (typeof t === 'string') {
        tagObject[t] = 'true';
      } else if (typeof t === 'object') {
        Object.assign(tagObject, t);
      }
    });

    // Encode the memory as a two-turn dialog:
    //   user turn  → the title / question
    //   assistant  → the full content / answer
    const response = await client.post('/v1/memories/ingest_dialog', {
      user_id: userId,
      messages: [
        { role: 'user', content: `[Memory] ${title}` },
        { role: 'assistant', content },
      ],
      tag: tagObject,
    });

    const { session_id, event_id } = response.data;
    console.log(`[Parcle] ✅ Memory saved → session_id=${session_id} event_id=${event_id}`);
    return session_id;
  } catch (err) {
    console.error('[Parcle] ❌ saveMemory failed:', err?.response?.data || err.message);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// 2. queryMemory(naturalLanguageQuery)
//    Searches Parcle with a plain-English question.
//    Returns an array of up to 5 result objects shaped as:
//      { answer, confidence, citations, query }
//    The search endpoint returns an SSE stream; we parse it here.
// ─────────────────────────────────────────────────────────────
async function queryMemory(naturalLanguageQuery) {
  console.log(`[Parcle] 🔍 queryMemory → "${naturalLanguageQuery}"`);

  try {
    const apiKey = process.env.PARCLE_API_KEY;
    if (!apiKey) throw new Error('PARCLE_API_KEY is not set.');

    // The search endpoint streams Server-Sent Events.
    // We request it as a stream and parse it chunk-by-chunk, destroying the stream as soon as we get the final data.
    const response = await axios.post(
      `${BASE_URL}/v1/memories/search`,
      {
        user_id: DEFAULT_USER_ID,
        query: naturalLanguageQuery,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        responseType: 'stream',
        timeout: 30_000,
      }
    );

    const stream = response.data;
    let buffer = '';
    let finalData = null;

    const resultPromise = new Promise((resolve, reject) => {
      let seenFinalEvent = false;

      stream.on('data', (chunk) => {
        buffer += chunk.toString('utf8');
        const lines = buffer.split('\n');
        
        // Keep the last partial line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed === 'event: final') {
            seenFinalEvent = true;
            continue;
          }
          if (seenFinalEvent && trimmed.startsWith('data:')) {
            try {
              finalData = JSON.parse(trimmed.slice(5).trim());
            } catch (err) {
              console.warn('[Parcle] Could not parse final SSE data:', trimmed);
            }
            // Got the final data, destroy stream and resolve
            stream.destroy();
            resolve(finalData);
            return;
          }
        }
      });

      stream.on('end', () => {
        resolve(finalData);
      });

      stream.on('error', (err) => {
        reject(err);
      });
    });

    finalData = await resultPromise;

    if (!finalData) {
      console.warn('[Parcle] No final event found in search SSE response.');
      return [];
    }

    console.log(
      `[Parcle] ✅ queryMemory result → confidence=${finalData.confidence} citations=${finalData.citations?.length ?? 0}`
    );

    // Return as an array of up to 5 enriched result objects
    const results = [
      {
        query: naturalLanguageQuery,
        answer: finalData.answer,
        confidence: finalData.confidence,
        citations: finalData.citations ?? [],
      },
    ];

    // If citations reference multiple sources, expand them into separate entries
    if (finalData.citations && finalData.citations.length > 1) {
      const extras = finalData.citations.slice(1, 5).map((citation) => ({
        query: naturalLanguageQuery,
        answer: finalData.answer,
        confidence: finalData.confidence,
        citations: [citation],
      }));
      results.push(...extras);
    }

    return results.slice(0, 5);
  } catch (err) {
    console.error('[Parcle] ❌ queryMemory failed:', err?.response?.data || err.message);
    return [];
  }
}

// ─────────────────────────────────────────────────────────────
// 3. listRecentMemories(limit = 10)
//    Fetches the most recent ingested sessions from Parcle,
//    sorted newest-first (order: "desc").
// ─────────────────────────────────────────────────────────────
async function listRecentMemories(limit = 10) {
  console.log(`[Parcle] 📋 listRecentMemories → limit=${limit}`);

  try {
    const client = createClient();

    const response = await client.post('/v1/memories/sources', {
      user_id: DEFAULT_USER_ID,
      type: 'session',
      order: 'desc',
      limit,
      page: 1,
    });

    const { sources = [], total } = response.data;

    console.log(`[Parcle] ✅ listRecentMemories → ${sources.length}/${total} sources returned`);

    // Sort by updated_at descending (API already does this, but be explicit)
    const sorted = [...sources].sort(
      (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
    );

    return sorted;
  } catch (err) {
    console.error('[Parcle] ❌ listRecentMemories failed:', err?.response?.data || err.message);
    return [];
  }
}

module.exports = { saveMemory, queryMemory, listRecentMemories };
