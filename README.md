# Happy Birthday, Bestie! ✦

Interactive 9-stage birthday sketchbook, real memories archive, mini-games & 3D studio cake experience built with **React 19**, **Vite 8**, **Tailwind CSS v4**, **Motion**, **Three.js / React Three Fiber v9**, and **WebAudio SFX**.

## Quick Setup

1. Apni Gemini-generated PNG image (`Gemini_Generated_Image_g1cacg1cacg1cacg.png`) ko copy karke **`public/images/face.png`** naam se save kar do (as-is, koi resize ya edit ki zaroorat nahi).
2. Confirm **`public/audios/1.mp3`** (28.34s) folder me hai.
3. Run:

```bash
npm install
npm run dev
```

## How the As-Is Pencil Drawing Works
- `src/lib/pencilEngine.js` directly reads `public/images/face.png` at full crisp resolution, detects its natural paper tone and ink/line contours, and reveals **your exact PNG as-is** stroke-by-stroke with a live moving wooden pencil nib synced to `public/audios/1.mp3` (28.34s).

## Customize Everything
All text, memories, chat flashback, mini-game questions, letter paragraphs, best highlighted line, and cake flavours live in **`src/config.js`**.
