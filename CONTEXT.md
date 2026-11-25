# Project Context

## Goal
User ki **best female friend** ke liye deep, multi-stage birthday surprise website (React).
Reference: `E:\UR-42\birthday-bloom-main` (open-source) — sirf **concept/pacing** liya gaya; repo modify nahi kiya. Tone **bestie / just friends wali**, couple ya family wali baatein nahi. Word **“bestie”** purposeful rakha hai; hearts sirf 2 chote finale me.

User Hinglish me baat karta hai; replies Hinglish me.

## Implemented flow
1. `loading` → audio metadata + image trace ready (3s fallback).
2. `start` → tap se experience shuru; headphone note.
3. `intro` → typed Hinglish lines (`TypeLines.jsx`), highlight + blinking cursor, skip button.
4. `draw` → `WireDraw.jsx` image ko binary line-art me trace karta hai (~250 alag SVG paths) aur **har line apne aap draw** hoti hai GSAP `DrawSVGPlugin` se. Audio `public/audios/1.mp3` (28.34s) ki `currentTime` se sync; glowing pen tip.
5. `quiet` → drawing ke baad **28 sec bilkul still** (no motion, no sound).
6. `letter` → envelope flap khulti hai, letter nikalta hai, text type hota hai, “Cake time” button.
7. `cakes` → 4 cakes choose → baking → candle blow (wind + smoke) → wish → 3-2-1 → knife → cut (slice + sparks) → confetti → bestie quotes.
8. `finale` → balloons, confetti bursts, staggered title, 2 chote hearts, closing note, replay button.

## Tech
- React 19 + Vite 8 (JS), npm. Scripts: `dev`, `build`, `lint`, `preview`.
- Libraries: `gsap` 3.15.1 (DrawSVGPlugin included/free), `canvas-confetti`, `imagetracerjs` 1.2.6 (Unlicense/public domain).
- `src/config.js` — single source of truth: naam, intro lines, letter, cakes, quotes, finale copy, colors, timings.
- Sound effects (`src/lib/sfx.js`) browser WebAudio se generated — koi extra audio files nahi.
- Purana height-chunk `SketchPortrait.jsx` delete kiya gaya; naya `WireDraw.jsx` actual per-line drawing karta hai.

## Assets
- `public/images/face.png` → **452×678**, beige bg, dark line art. Dummy hai; user original image se replace kar sakta hai bina code badle.
- `public/audios/1.mp3` → **28.34 sec**, wire drawing ke saath sync.

## Validation
- `npx oxlint src` → clean.
- `npm run build` → pass (Vite build).
- Purana `SketchPortrait.jsx` aur `trace-preview.svg` remove kiye gaye.

## User-editing notes
- Naam badalna: `CONFIG.friendName`, `CONFIG.letter.paragraphs`, `CONFIG.finale`.
- Drawing speed: `CONFIG.drawSeconds` (`'audio'` ya number). Quiet phase: `CONFIG.quietSeconds`.
- Trace quality: `WireDraw.jsx` me `width: 300` aur `pathomit: 14` — zyada details chahiye to `pathomit` kam karo (aur paths/CPU badhega).
- Ref repo me family/couple copy aur pink overload tha; yahan sab bestie tone me rewritten hai.
