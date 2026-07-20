# ToneAmp — the site

The marketing site for **ToneAmp**, the iOS app that shows guitarists how to
dial in the tone of any song. Built to play by the app's own rules: the whole
page is one guitar signal, and it distorts as you go.

## The idea

**The page is a signal chain.** A glowing WebGL oscilloscope spans the
viewport, and as you scroll its waveform waveshapes from a clean sine into a
hard-clipped, fuzzed square — while its colour ramps clean-teal → valve-amber
→ hot-orange, and a warm ember field breathes behind it. That's the app in one
gesture: a song's real recipe, climbing its own gain stage into the sound in
your hands (`src/gl/Scene.ts`).

**Hear the gain.** An opt-in Web Audio drone — three detuned sawtooth voices
through a waveshaper whose distortion and a lowpass whose brightness both track
the page's gain — lets you *hear* the chain climb (`src/fx/audio.ts`). Off by
default.

**Everything is procedural.** No 3D assets — the waveform, embers, and grain
are all generated. The only images are real app screenshots in device frames.

## Stack

Vite · TypeScript · Three.js (fat-line oscilloscope) · GSAP (counters, knobs) ·
Lenis (smooth scroll + the gain loop) · Web Audio · self-hosted variable fonts
(Space Grotesk + JetBrains Mono via Fontsource). No framework.

## Develop

```bash
npm install
npm run dev        # http://localhost:4331
npm run build      # typecheck + bundle to dist/
npm run preview
```

## Accessibility

`prefers-reduced-motion` freezes the waveform motion, camera parallax, counters
and knob springs. Sound is off until explicitly enabled. The site is fully
readable with WebGL unavailable (the canvas is dropped, DOM remains). Custom
cursor only on fine pointers.

## Deploy

Production: **https://toneamp.netnucleus.solutions** — `/opt/toneamp-site` on
netnucleus-hetzner-1 (89.167.97.94): `nginx:alpine` on the shared `kimlix_web`
network, routed by the kimlix traefik (Let's Encrypt resolver `le`).

```bash
npm run build
./scripts/deploy.sh
```

The deploy script ships `dist/` **into** the container's bind-mounted `dist/`
(replacing the directory itself would break the mount), syncs the compose +
nginx config, and restarts the container.

© NetNucleus.
