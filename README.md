# Pip's Midnight Nursery

Baby's First Website · Track 1 (Pip, the Skull Baby) · Boss Level.
Next.js 16 · React 19 · three.js / R3F · GSAP · Firebase Realtime Database.

## Run
```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Firebase (live guestbook + visit counter)
The web config is public by design. Safety comes from `database.rules.json`:
paste it into Firebase Console > Realtime Database > Rules and publish.
Until then, if the database is locked the site falls back to "offline mode"
(wishes pin on the device only). Override the config with `.env.local`
(see `.env.example`).

## What's where
- `components/Hero.tsx` eye tracking, hidden-moon Easter egg (tickle it 3x)
- `components/LullabyLab.tsx` + `lib/audio.ts` Web Audio synth music box, global mute
- `components/Story.tsx` GSAP pinned horizontal story (swipe on phones)
- `components/Nightlights.tsx` Componentry OrbitCardStack + React Bits GhostFibers
- `components/Toybox.tsx` matter-js physics playpen (blocks, stars, moon, balls)
- `components/Storybook.tsx` CSS 3D flip-book + React Bits HalftoneReveal cover
- `components/Growth.tsx` growth chart
- `components/Pip3D.tsx` + `Hold.tsx` three.js Pip (touch devices get sway + head-turn instead of drag so page scroll isn't trapped)
- `components/Guestbook.tsx` Firebase wall + React Bits TearTicket
- `components/PipChat.tsx` + `lib/pip-brain.ts` rule-based chat in Pip's voice
- `lib/memory.ts` returning-visitor memory (localStorage)
- `components/CursorTrail.tsx` sparkle trail via the `cursor-effects` library
- `components/vendor/*` copied component source (React Bits, Componentry)

## Credits
Art: official haX.baby Pip Creator Asset Pack. Derivatives made from it:
cut-out moon/stars, lantern-in-hand and unicorn crops, a "Pocket Moon" scene
composed from the moon and stars, and a hero copy with the baked eye glow
inpainted out so the cursor-following glow can replace it.
Code: React Bits, Componentry, cursor-effects, three.js, R3F, drei, GSAP,
Matter.js, motion, canvas-confetti, Firebase. Fonts: Fraunces, Fredoka, Nunito
(OFL). All sound is synthesised live. Built with Claude (AI-assisted).
