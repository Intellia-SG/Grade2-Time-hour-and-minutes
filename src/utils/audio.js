// ─── Offline Audio Player ────────────────────────────────────────────────────
// All audio is served from pre-generated MP3 files in public/audio/.
// To add new lines: update narration.js then run `npm run generate:audio`.
// No live API calls are made at runtime.

let currentQueue = null;
let isSpeaking   = false;
let currentAudio = null;
let playId       = 0;

import { audioMap } from './audioMap.js';

// ── Resolve a local MP3 path for a given text ────────────────────────────────
function getAudioUrl(text) {
  return audioMap[text] || null;
}

// ── Play a single narration segment ─────────────────────────────────────────
export function speak(text, enabled = true) {
  return new Promise(resolve => {
    if (!enabled || !text?.trim()) { resolve(); return; }

    playId++;
    const thisPlayId = playId;
    isSpeaking = true;

    const url = getAudioUrl(text);
    if (!url) {
      // Audio file not found — skip silently (no browser TTS fallback)
      isSpeaking = false;
      resolve();
      return;
    }

    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    currentAudio = new Audio(url);
    currentAudio.onended = () => { isSpeaking = false; resolve(); };
    currentAudio.onerror = () => { isSpeaking = false; resolve(); };

    currentAudio.play().catch(() => { isSpeaking = false; resolve(); });
  });
}

// ─── Narration Segment Helpers ───────────────────────────────────────────────
export function seg(text, style = 'statement', pause = 0) {
  return { text, style, pause };
}

export const say      = (text, pause = 0) => seg(text, 'statement',   pause);
export const ask      = (text, pause = 0) => seg(text, 'question',    pause);
export const cheer    = (text, pause = 0) => seg(text, 'encouragement', pause);
export const emphasize= (text, pause = 0) => seg(text, 'emphasis',    pause);
export const think    = (text, pause = 0) => seg(text, 'thinking',    pause);
export const celebrate= (text, pause = 0) => seg(text, 'celebration', pause);
export const instruct = (text, pause = 0) => seg(text, 'instruction', pause);
export const pause    = (ms  = 0)         => seg('',   'statement',   ms);

// Pre-warm the browser audio cache (no-op here, kept for API compatibility)
export function preloadNarration(_segments) {}

// ── Play a sequence of segments ──────────────────────────────────────────────
export function narrate(segments, enabled = true) {
  const queueId = Symbol('narration');
  currentQueue  = queueId;
  let cancelled = false;

  const cancel = () => {
    cancelled = true;
    if (currentQueue === queueId) {
      if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; }
      isSpeaking   = false;
      currentQueue = null;
    }
  };

  const promise = (async () => {
    if (!enabled || !segments?.length) return;

    for (const segment of segments) {
      if (cancelled || currentQueue !== queueId) return;

      if (segment.text?.trim()) {
        await speak(segment.text, true);
      }

      if (segment.pause > 0 && !cancelled && currentQueue === queueId) {
        await new Promise(r => setTimeout(r, segment.pause));
      }
    }
  })();

  return { cancel, promise };
}

// ── Stop all playback ────────────────────────────────────────────────────────
export function stopNarration() {
  playId++;
  currentQueue = null;
  if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; currentAudio = null; }
  isSpeaking = false;
}

// ─── Simple tone generation (UI feedback sounds) ─────────────────────────────
let audioCtx = null;
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

export function playTone(frequency, duration = 200) {
  try {
    const ctx  = getCtx();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration / 1000);
  } catch (e) { /* silent */ }
}

export const sounds = {
  correct: () => { playTone(523,150); setTimeout(()=>playTone(659,150),150); setTimeout(()=>playTone(784,200),300); },
  wrong:   () => { playTone(220,300); },
  badge:   () => { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>playTone(f,200),i*150)); },
  click:   () => playTone(440,80),
  streak:  () => { playTone(880,100); setTimeout(()=>playTone(1100,150),100); },
};
