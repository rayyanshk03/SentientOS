/**
 * agent.js — Core Agent Logic for SentinentOS / Eternal Architect
 *
 * runAgent(userTask) follows a 5-step loop:
 *  1. Query Parcle for relevant past decisions
 *  2. Build a context-aware system prompt
 *  3. Call Google Gemini API (free tier, gemini-2.0-flash)
 *  4. Save the decision back to Parcle memory
 *  5. Return the agent response to the caller
 */

require('dotenv').config({ path: '../.env' });
const { GoogleGenAI } = require('@google/genai');
const { queryMemory, saveMemory } = require('./parcle');

// ── Gemini Models Configuration ──────────────────────────────
const FALLBACK_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.5-pro'
];

function createGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('GEMINI_API_KEY is not set in .env');
  }
  return new GoogleGenAI({ apiKey });
}

// ── runAgent ────────────────────────────────────────────────
/**
 * Runs the full agent loop for a given user task.
 *
 * @param {string} userTask - The task or question from the user.
 * @returns {Promise<{
 *   response: string,
 *   sessionId: string|null,
 *   retrievedMemories: Array<{ title: string, confidence: number, citationIds: string[] }>
 * }>}
 */
async function runAgent(userTask) {
  console.log('\n═══════════════════════════════════════════');
  console.log(`[Agent] 🚀 runAgent started`);
  console.log(`[Agent] 📝 Task: "${userTask}"`);
  console.log('═══════════════════════════════════════════');

  // ── Step 1: Query Parcle for relevant past decisions ──────
  console.log('\n[Agent] Step 1 — Querying Parcle memory...');
  let parcleMemories = [];
  try {
    parcleMemories = await queryMemory(userTask);
    console.log(`[Agent] Retrieved ${parcleMemories.length} relevant memory(s) from Parcle.`);
  } catch (err) {
    console.warn('[Agent] Parcle query failed, continuing without memory context:', err.message);
  }

  // Shape retrieved memories for the frontend — strip heavy answer text
  const retrievedMemories = parcleMemories.map((m, i) => ({
    title: m.answer
      ? m.answer.split('\n')[0].replace(/^#+\s*/, '').trim().slice(0, 90) || `Memory ${i + 1}`
      : `Memory ${i + 1}`,
    confidence: Math.round((m.confidence ?? 0) * 100),
    citationIds: (m.citations ?? []).map((c) => c.id ?? c.session_id ?? String(c)).filter(Boolean),
  }));

  // ── Step 2: Build context-aware prompt ───────────────────
  console.log('\n[Agent] Step 2 — Building context-aware prompt...');
  
  let memorySummary = 'No prior decisions found for this project yet.';
  if (parcleMemories.length > 0) {
    memorySummary = parcleMemories
      .map((m, i) => {
        const citationIds = m.citations?.map((c) => c.id).join(', ') || 'N/A';
        return [
          `Memory ${i + 1} (confidence: ${((m.confidence ?? 0) * 100).toFixed(0)}%, sources: ${citationIds}):`,
          m.answer,
        ].join('\n');
      })
      .join('\n\n');
  }

  const systemPrompt = [
    'You are Eternal Architect — a helpful AI assistant and senior software architect for the SentientOS project.',
    '',
    'CONTEXT FROM MEMORY:',
    memorySummary,
    '',
    `USER MESSAGE: ${userTask}`,
    '',
    'RESPONSE RULES — read the intent and match your style:',
    '',
    '• If the user is asking a SIMPLE question (who, what, where, greetings, quick facts):',
    '  → Reply in 1-3 plain conversational sentences. No headers, no bullet points, no code.',
    '  → Example: "Your name is Rayyan." or "The frontend stack uses React + Vite."',
    '',
    '• If the user is asking for EXPLANATION or OVERVIEW:',
    '  → Use short paragraphs with clear language. Occasional bullet points are fine.',
    '  → Keep it readable and friendly, not like a formal document.',
    '',
    '• If the user is asking for a TECHNICAL PLAN or HOW TO BUILD something:',
    '  → Use structured format: short summary → numbered steps → code snippets if needed.',
    '  → Still keep language friendly, not robotic.',
    '',
    'NEVER start with "Plan summary:", "Implementation steps:", or similar robotic headers for simple questions.',
    'NEVER contradict past decisions stored in memory.',
    'ALWAYS match your tone to the question — casual question = casual answer.',
  ].join('\n');

  console.log('[Agent] Prompt built with', parcleMemories.length, 'memory context(s).');

  // ── Step 3: Call Gemini API (with fallbacks) ──────────────
  let agentResponse = '';
  let successfulModel = '';
  const ai = createGenAI();
  
  for (const model of FALLBACK_MODELS) {
    console.log(`\n[Agent] Step 3 — Calling Gemini using model: ${model}...`);
    try {
      const result = await ai.models.generateContent({
        model: model,
        contents: systemPrompt,
      });
      agentResponse = result.text ?? '';
      successfulModel = model;
      console.log(`[Agent] ✅ Gemini response received (${agentResponse.length} chars) using ${model}.`);
      break;
    } catch (err) {
      console.warn(`[Agent] ⚠️ Model ${model} failed:`, err.message);
    }
  }

  if (!agentResponse) {
    console.error('[Agent] ❌ All fallback Gemini models failed.');
    throw new Error('Agent LLM call failed: All fallback models are unavailable or rate-limited.');
  }

  // ── Step 4: Save decision to Parcle ──────────────────────
  console.log('\n[Agent] Step 4 — Saving decision to Parcle...');
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  // Generate a short title from the user task (first 80 chars)
  const decisionTitle = userTask.length > 80 ? `${userTask.slice(0, 77)}...` : userTask;
  let sessionId = null;
  try {
    sessionId = await saveMemory(decisionTitle, agentResponse, [
      'type:decision',
      'project:eternal-architect',
      `date:${today}`,
    ]);
    console.log(`[Agent] ✅ Decision saved to Parcle → session_id=${sessionId}`);
  } catch (err) {
    // Non-fatal — we still return the response even if saving fails
    console.warn('[Agent] ⚠️  Failed to save decision to Parcle:', err.message);
  }

  // ── Step 5: Return ────────────────────────────────────────
  console.log('\n[Agent] ✅ runAgent complete.\n');
  return {
    response: agentResponse,
    sessionId,
    memoriesUsed: parcleMemories.length,
    retrievedMemories,   // ← new: array of { title, confidence, citationIds[] }
  };
}

module.exports = { runAgent };
