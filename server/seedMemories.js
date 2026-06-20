/**
 * seedMemories.js — One-time script to seed Parcle with initial project knowledge.
 *
 * Run with:  node server/seedMemories.js
 *
 * Each memory is saved as a two-turn dialog (user: title, assistant: content)
 * so it's immediately searchable by the agent's queryMemory() call.
 */

require('dotenv').config({ path: './.env' });
const { saveMemory } = require('./parcle');

// ── Seed data ──────────────────────────────────────────────────────────────────
const SEEDS = [
  {
    title: 'Frontend Stack Decision',
    content: 'We use React + Vite + Tailwind CSS. No plain CSS files. No Bootstrap.',
    tags: ['decision', 'frontend', 'stack'],
  },
  {
    title: 'Backend Stack Decision',
    content: 'Node.js + Express only. No NestJS. No TypeScript on backend.',
    tags: ['decision', 'backend', 'stack'],
  },
  {
    title: 'API Design Pattern',
    content:
      'All routes prefix with /api/. Always return JSON. Use 200/400/500 status codes.',
    tags: ['decision', 'api', 'pattern'],
  },
  {
    title: 'Memory Strategy',
    content:
      'Every agent decision must be saved to Parcle immediately after execution.',
    tags: ['decision', 'memory', 'parcle'],
  },
  {
    title: 'Styling Rules',
    content:
      'Apple design system: white backgrounds, #0071E3 accent, Inter font, ' +
      'no gradients on content, 8px border radius on cards.',
    tags: ['decision', 'design', 'ui'],
  },
  {
    title: 'Error Handling Rule',
    content:
      'Never throw unhandled errors. All async functions wrapped in try/catch. ' +
      'Always return a fallback response.',
    tags: ['decision', 'error-handling'],
  },
];

// ── Runner ─────────────────────────────────────────────────────────────────────
async function seedAll() {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║       SentientOS — Parcle Memory Seeder      ║');
  console.log('╚══════════════════════════════════════════════╝\n');
  console.log(`Seeding ${SEEDS.length} memories into Parcle...\n`);

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < SEEDS.length; i++) {
    const { title, content, tags } = SEEDS[i];
    const num = `[${i + 1}/${SEEDS.length}]`;

    process.stdout.write(`${num} "${title}" … `);

    try {
      const sessionId = await saveMemory(title, content, tags);

      if (sessionId) {
        console.log(`✅  saved  (session_id: ${sessionId})`);
        passed++;
      } else {
        console.log('⚠️   saveMemory returned null — check Parcle logs above');
        failed++;
      }
    } catch (err) {
      console.log(`❌  ERROR: ${err.message}`);
      failed++;
    }

    // Small delay so we don't hammer the Parcle API
    if (i < SEEDS.length - 1) {
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  console.log('\n──────────────────────────────────────────────');
  console.log(`  Done.  ✅ ${passed} seeded   ❌ ${failed} failed`);
  console.log('──────────────────────────────────────────────\n');

  if (failed > 0) {
    process.exit(1);
  }
}

seedAll().catch((err) => {
  console.error('\n[Seeder] Fatal error:', err.message);
  process.exit(1);
});
