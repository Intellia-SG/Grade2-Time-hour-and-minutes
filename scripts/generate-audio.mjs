/**
 * generate-audio.mjs
 * ──────────────────
 * Generates MP3 files for every narration line in the app using ElevenLabs.
 * Run once:  node scripts/generate-audio.mjs
 *
 * Output:
 *   • public/audio/<hash>.mp3   – one file per unique narration line
 *   • src/utils/audioMap.js     – maps each text → /audio/<hash>.mp3
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── Load API key ────────────────────────────────────────────────────────────
// Priority: api-key/.env → root .env → env var
function loadKey() {
  const sources = [
    path.join(ROOT, 'api-key', '.env'),
    path.join(ROOT, '.env'),
  ];
  for (const src of sources) {
    if (fs.existsSync(src)) {
      const raw = fs.readFileSync(src, 'utf8');
      const match = raw.match(/(?:ELEVENLABS_API_KEY|VITE_ELEVENLABS_API_KEY)\s*=\s*(.+)/);
      if (match) return match[1].trim();
    }
  }
  return process.env.ELEVENLABS_API_KEY || process.env.VITE_ELEVENLABS_API_KEY || null;
}

const API_KEY = loadKey();
if (!API_KEY) {
  console.error('❌ No ElevenLabs API key found. Add it to api-key/.env or .env');
  process.exit(1);
}

// ── Config ──────────────────────────────────────────────────────────────────
const VOICE_ID   = 'Xb7hH8MSUJpSbSDYk0k2'; // Aria – teacher-like
const MODEL_ID   = 'eleven_multilingual_v2';
const AUDIO_DIR  = path.join(ROOT, 'public', 'audio');
const MAP_FILE   = path.join(ROOT, 'src', 'utils', 'audioMap.js');

// ── All narration lines (mirrors narration.js) ──────────────────────────────
const SEGMENTS = [
  // Intro
  { text: "Welcome to Tick Tock Academy!",                                      style: 'encouragement' },
  { text: "Today, we are going to learn how to tell time using hours and minutes.", style: 'statement' },
  { text: "Have you ever wondered how the hands on a clock move to show us the time?", style: 'question' },
  { text: "Let us start our journey to unlock the secrets of the clock!",        style: 'encouragement' },

  // Story – slide 0
  { text: "Meet Pip the Robot! Pip has a clock on his chest, but the hands are missing!", style: 'statement' },
  { text: "Without the hands, Clocktown is frozen. Pip needs your help to restore the clock hands and start time again!", style: 'statement' },

  // Story – slide 1
  { text: "Look at the short, blue hand. That is the hour hand!",                style: 'statement' },
  { text: "The hour hand is short and chubby. It points directly to the hours: one, two, three, all the way to twelve!", style: 'emphasis' },

  // Story – slide 2
  { text: "Now meet the tall, red hand. That is the minute hand!",               style: 'statement' },
  { text: "The minute hand is tall and thin. It counts the minutes as they tick by. It moves faster than the hour hand!", style: 'emphasis' },

  // Story – slide 3
  { text: "When the minute hand points straight up at twelve, it is an o'clock time. It shows a brand new hour!", style: 'statement' },
  { text: "But when it points straight down at six, it is half past the hour! That means thirty minutes have passed.", style: 'statement' },

  // Story – slide 4
  { text: "We can also say quarter past when the minute hand points to three, which is fifteen minutes.", style: 'statement' },
  { text: "And when it points to nine, it is quarter to the next hour, which is forty-five minutes!", style: 'statement' },

  // Story – slide 5
  { text: "You are ready to help Pip restore Clocktown!",                        style: 'encouragement' },
  { text: "Let us start by simulating and building times ourselves. Here we go!", style: 'statement' },

  // Simulate
  { text: "Set the clock to the target time. Use the buttons to rotate the hour and minute hands!", style: 'instruction' },
  { text: "Look at the analog clock. Which digital clock shows the same time? Tap to select!", style: 'instruction' },
  { text: "Look at the clock face. Type the digital time in the boxes using the number pad!", style: 'question' },

  // Play
  { text: "That is correct!",                                                    style: 'encouragement' },
  { text: "Incredible streak! You are a time hero!",                             style: 'encouragement' },
  { text: "Not quite. Let us try another one!",                                  style: 'statement' },

  // Reflect
  { text: "Let us reflect on what we learned today! Help me answer these questions!", style: 'question' },
  { text: "Excellent teaching!",                                                  style: 'encouragement' },
  { text: "Ah, I see. Let us review that again!",                                style: 'statement' },
  { text: "How confident do you feel about telling time now?",                   style: 'question' },
];

// ── Voice settings per style ─────────────────────────────────────────────────
function voiceSettings(style) {
  switch (style) {
    case 'celebration':   return { stability: 0.12, similarity_boost: 0.45, style: 0.75, use_speaker_boost: true };
    case 'encouragement': return { stability: 0.16, similarity_boost: 0.50, style: 0.65, use_speaker_boost: true };
    case 'question':      return { stability: 0.20, similarity_boost: 0.55, style: 0.55, use_speaker_boost: true };
    case 'emphasis':      return { stability: 0.16, similarity_boost: 0.50, style: 0.60, use_speaker_boost: true };
    case 'thinking':      return { stability: 0.24, similarity_boost: 0.60, style: 0.35, use_speaker_boost: true };
    default:              return { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true };
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function hash(text) {
  return crypto.createHash('md5').update(text).digest('hex').slice(0, 12);
}

async function fetchAudio(text, style) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': API_KEY,
    },
    body: JSON.stringify({
      text,
      model_id: MODEL_ID,
      voice_settings: voiceSettings(style),
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs API error ${res.status}: ${err}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

// ── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });

  // Deduplicate by text
  const unique = [...new Map(SEGMENTS.map(s => [s.text, s])).values()];
  const map = {};

  // Load existing map to skip already-generated files
  let existing = {};
  if (fs.existsSync(MAP_FILE)) {
    const raw = fs.readFileSync(MAP_FILE, 'utf8');
    const matches = [...raw.matchAll(/"([^"]+)":\s*"([^"]+)"/g)];
    matches.forEach(([, k, v]) => { existing[k] = v; });
    console.log(`📂 Found ${Object.keys(existing).length} existing audio entries.`);
  }

  let generated = 0, skipped = 0, failed = 0;

  for (const { text, style } of unique) {
    const key  = hash(text);
    const file = `${key}.mp3`;
    const dest = path.join(AUDIO_DIR, file);
    const url  = `/audio/${file}`;

    // Already exists on disk → skip API call
    if (existing[text] || fs.existsSync(dest)) {
      console.log(`  ⏭  Skipping (exists): "${text.slice(0, 60)}..."`);
      map[text] = url;
      skipped++;
      continue;
    }

    process.stdout.write(`  🎙  Generating: "${text.slice(0, 55)}..." `);
    try {
      const audio = await fetchAudio(text, style);
      fs.writeFileSync(dest, audio);
      map[text] = url;
      generated++;
      console.log(`✅  → ${file}`);
    } catch (e) {
      failed++;
      console.log(`❌  FAILED: ${e.message}`);
    }

    // Polite rate-limit pause (500 ms between requests)
    await new Promise(r => setTimeout(r, 500));
  }

  // Write audioMap.js
  const entries = Object.entries(map)
    .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)}`)
    .join(',\n');

  const output = `// AUTO-GENERATED by scripts/generate-audio.mjs – do not edit manually
// Run: node scripts/generate-audio.mjs

export const audioMap = {
${entries}
};
`;

  fs.writeFileSync(MAP_FILE, output, 'utf8');

  console.log('\n─────────────────────────────────────────');
  console.log(`✅ Generated : ${generated}`);
  console.log(`⏭  Skipped  : ${skipped}`);
  console.log(`❌ Failed    : ${failed}`);
  console.log(`📁 Audio dir : public/audio/`);
  console.log(`🗺  Map file  : src/utils/audioMap.js`);
  console.log('─────────────────────────────────────────');
  console.log('\n🎉 Done! Restart your dev server to use offline audio.');
})();
