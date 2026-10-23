# Guitarist — Interactive Guitar Academy & Studio

An interactive guitar learning platform featuring a playable physical modeling fretboard, Web Audio API acoustic string synthesizer, chord soundboard, strumming rhythm engine, song player, and tuner.

---

## Features

- **Interactive Karplus-Strong Fretboard**: Real-time acoustic string physical modeling with wood body resonance filter. Pluck any string or fret to hear realistic acoustic guitar audio.
- **Chord Library & Soundboard**: Interactive chord diagrams with finger numbers, open strings ($\bigcirc$), and muted strings ($\text{✕}$). Strum chords down or up with natural string stagger.
- **Guided Academy**: Step-by-step beginner curriculum covering guitar anatomy, string tuning mnemonics, essential chords ($Em, E, Am, C, G, D$), and ergonomics.
- **Rhythm & Strumming Lab**: Visual pendulum beat tracker with downstroke and upstroke animations, ghost stroke guidance, and metronome ($40\text{--}180\text{ BPM}$).
- **Interactive Song Player**: Play-along backing engine with synchronized lyrics, chord transitions, and live fretboard finger updating in real-time.
- **60-Second Transition Drill**: Muscle-memory speed trainer with countdown timer and switches-per-minute counter.
- **Chromatic Tuner**: Autocorrelation pitch detection via microphone with visual cents needle and pure reference tones.

---

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 8 (optimized client build)
- **Styling**: Tailwind CSS v4
- **Audio Engine**: Web Audio API (Karplus-Strong physical string synthesis, Biquad body filter, time-domain Autocorrelation pitch detector)
- **Icons**: Lucide React
- **Animations**: CSS string vibration & Motion

---

## Getting Started

### Prerequisites

- Node.js `20.x` or `22.x`
- npm `10.x` or later

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Runs the development server at `http://localhost:3000`.

### Type Check & Lint

```bash
npm run lint
```

### Production Build

```bash
npm run build
```

The compiled production assets will be generated in the `dist/` directory.

---

## Vercel Deployment

This project is configured for seamless deployment on Vercel as a Vite SPA:

1. Import the repository into your Vercel dashboard: `https://github.com/MalikShaikh-max/guitarist.git`.
2. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (repository root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
3. Click **Deploy**.

`vercel.json` is included to handle client-side routing rewrites (`/* -> /index.html`) so refreshing or direct navigation works without 404 errors.

---

## Dependency Compatibility Note

In `package.json`, Vite 8 (`vite@^8.3.0`) requires `esbuild@^0.27.0 || ^0.28.0` as its peer dependency. `esbuild` is locked to `^0.28.0` and a synchronized `package-lock.json` is committed to ensure zero `ERESOLVE` conflicts during deployment.
