# Number Bonds Audio & Narration Pipeline

This document outlines the architecture and workflow of the custom text-to-speech audio narration pipeline used in the Counting of Numbers educational module. The system is designed to provide high-quality, perfectly synchronized, and emotionally resonant narration using ElevenLabs.

## Overview
The application utilizes a hybrid audio pipeline:
1. **Pre-generation:** Known educational scripts are pre-generated offline using a Node.js script and stored as static `.mp3` assets to ensure zero-latency playback on low-end devices.
2. **Dynamic Fallback:** If a text string hasn't been pre-generated, the system can fall back to requesting it on-the-fly via the ElevenLabs API.
3. **Synchronization:** The frontend audio engine plays segments sequentially with eager preloading, eliminating latency gaps between sentences.

---

## 1. Voice Profile & Settings

- **Voice Provider:** ElevenLabs
- **Voice Name:** Alice (Clear, Engaging Educator)
- **Voice ID:** `Xb7hH8MSUJpSbSDYk0k2`
- **Model:** `eleven_multilingual_v2`

### Voice Settings by Style (copied from numberbound)

| Style | Stability | Similarity Boost | Style | Speaker Boost |
|-------|-----------|-----------------|-------|---------------|
| `celebration` | 0.12 | 0.45 | 0.75 | ✅ |
| `encouragement` | 0.16 | 0.50 | 0.65 | ✅ |
| `question` | 0.20 | 0.55 | 0.55 | ✅ |
| `emphasis` | 0.16 | 0.50 | 0.60 | ✅ |
| `thinking` | 0.24 | 0.60 | 0.35 | ✅ |
| `statement` / `instruction` | 0.20 | 0.55 | 0.50 | ✅ |

### Content Policy: Paragraphs & Questions ONLY
> **IMPORTANT:** Audio is generated ONLY for paragraph text and questions. Titles, headings, and section labels are NEVER narrated. This prevents repetitive title reading and keeps narration focused on educational content.

---

## 2. Pipeline Components

### A. Offline Generation (`scripts/generate_audio.js`)
This script automates the creation of static audio files for all predefined narration.
- Reads an array of `phrases` containing the exact `text` and intended `style`.
- Applies per-style ElevenLabs voice settings (`stability`, `similarity_boost`, `style`, `use_speaker_boost`).
- Hits the direct ElevenLabs text-to-speech API using the `.env.local` variable `VITE_ELEVENLABS_API_KEY`.
- Saves the resulting `.mp3` files into `public/assets/audio/` with descriptive slugified filenames.
- Automatically generates and writes `src/utils/audioMap.js`.
- Rate-limits at 500ms between API calls.

### B. Audio Mapping (`src/utils/audioMap.js`)
This file is an auto-generated JavaScript module that exports a dictionary (`audioMap`).
- **Key:** The exact string of text to be spoken.
- **Value:** The relative path to the pre-generated `.mp3` file (e.g., `/assets/audio/audio_ready_for_a_counting_adventure_0.mp3`).
- The frontend uses this to perform an exact match and bypass dynamic generation entirely.

### C. Audio Cleanup (`scripts/clean_audio.js`)
A utility script used to maintain a clean repository.
- It imports `audioMap.js` to determine all valid, currently referenced audio files.
- It scans `public/assets/audio/` and deletes any `.mp3` files that are no longer present in the active `audioMap`.

### D. Audio Engine (`src/utils/audio.js`)
The core playback engine with queue management and ElevenLabs integration:
1. **Segment helpers:** `say()`, `ask()`, `cheer()`, `emphasize()`, `think()`, `celebrate()`, `instruct()` — create styled narration segments.
2. **Cache check:** `getAudioUrl(text, style)` first checks `audioMap[text]`. If found, immediately resolves the static asset URL.
3. **Dynamic Request:** If not found, attempts to fetch via `/api/elevenlabs` proxy or directly to ElevenLabs with per-style voice settings.
4. **Queue Management:** `narrate(segments)` plays an array sequentially with a `currentQueue` symbol to prevent overlapping. `stopNarration()` immediately halts playback.
5. **Preloading:** While playing segment `i`, preemptively calls `getAudioUrl` for segment `i+1`.

### E. Narration Scripts (`src/utils/narration.js`)
This module maps application phases to their respective audio scripts using the segment helpers.
- Exports phase-specific functions: `introNarration()`, `wonderNarration()`, `getStoryNarration()`, `simulateStation*Intro()`, `reflectQuestionNarration()`, etc.
- **Only includes paragraph text and questions — NEVER titles.**
- Ensures 1:1 strict parity with the on-screen text shown in UI components.

---

## 3. Workflow: Updating or Adding Narration

To update the script or add a new spoken line, follow these steps strictly to maintain synchronization:

1. **Update `generate_audio.js`:**
   Add your new exact text and its intended style to the `phrases` array inside `scripts/generate_audio.js`.
   ```javascript
   { text: "Here is my new pedagogical line!", style: 'statement' },
   ```
   > ⚠️ Only add paragraph/question text. Never add titles.

2. **Generate the audio:**
   Run the generation script. This will hit the ElevenLabs API, save the new `.mp3`, and update `audioMap.js`.
   ```bash
   node scripts/generate_audio.js
   ```

3. **Clean up old audio (Optional but recommended):**
   Run the cleanup script to remove orphaned files if you deleted or modified text.
   ```bash
   node scripts/clean_audio.js
   ```

4. **Update `narration.js`:**
   Implement the exact same text string into the relevant phase function in `src/utils/narration.js` using the matching helper function.
   ```javascript
   export function myNewPhaseNarration() {
     return [
       say("Here is my new pedagogical line!")
     ];
   }
   ```

5. **Wire the component:**
   In the relevant component, import and call your narration function with `narrate()`:
   ```javascript
   import { narrate, stopNarration } from '../utils/audio';
   import { myNewPhaseNarration } from '../utils/narration';

   useEffect(() => {
     if (audioEnabled) narrate(myNewPhaseNarration(), true);
     return () => stopNarration();
   }, [audioEnabled]);
   ```
   *Note: Ensure the text passed to `say()` perfectly matches the text in your UI components.*
