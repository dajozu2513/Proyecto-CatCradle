# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CatCradle is a real-time hand-tracking generative art web app. It uses Google MediaPipe for hand detection and p5.js for canvas rendering. **There is no build step** — the entire application lives in a single `index.html` file with embedded CSS and JavaScript.

## Running the App

Open `index.html` directly in a modern browser (Chrome, Edge, Firefox, Safari 14+). The app requires webcam access. No server, no npm install, no compilation.

All dependencies load from CDN:
- `@mediapipe/hands@0.4.1646424915` — Hand landmark detection
- `@mediapipe/camera_utils@0.3.1640029074` — Webcam integration
- `p5.js@1.9.4` — Canvas rendering

## Architecture

Everything lives in `index.html`, organized in three sections:

**CSS (lines ~16–296):** Design tokens (`--ink`, `--white`, `--dim`, `--faint`), HUD layout, slide-in control panel. Typography: Cormorant Garamond (display/labels) + Montserrat (UI controls).

**HTML (lines ~298–390):** Video element for webcam, overlay HUD corners/indicators, right-side control panel with mode buttons and parameter sliders.

**JavaScript (lines ~392–926):** Core logic split across these concerns:

- **`initMP()`** — Initializes MediaPipe Hands (1280×720, up to 2 hands, complexity=1) and wires webcam → detection → results callback.
- **`setup()` / `draw()`** — p5.js lifecycle. `draw()` runs at 60fps: renders trail blur, mirrors webcam feed, draws background grid, dispatches to active mode function, then draws hand skeleton/joints on top.
- **`lx()` / `ly()`** — Coordinate transforms: MediaPipe normalized coords → canvas pixels (horizontally mirrored).
- **`drawBones()` / `drawDots()`** — Renders the 21-landmark hand skeleton and pulsing joint dots.
- **Six visualization modes** (each a standalone function):
  - `modeNeuralWeb()` — Complete bipartite graph K₅,₅ between fingertips with elastic bezier curves
  - `modeHelix()` — Twin stranded spirals between hand centers
  - `modeSigilGate()` — Concentric rotating polygons forming a mandala
  - `modeCircuit()` — Orthogonal L-shaped paths with animated particle traces
  - `modeVortex()` — Spinning concentric ellipses spiraling inward
  - `modeConstellation()` — Proximity-based graph connecting nearby fingertips

**Global `P` object** holds all live parameters (glow, trail opacity, video mix, line weight, sag/wobble, dot size, anim speed). Sliders in the control panel write directly to `P`; modes read from `P` each frame.

**Temporal animation** uses accumulated `T` (scaled by `P.speed`) — all oscillations and rotations are sinusoidal functions of `T`, giving the "elastic string" physical feel.

## Key Design Conventions

- **Glow rendering:** Modes render each shape multiple times at decreasing blur radii to simulate luminous glow. Never remove multi-pass shadow draws.
- **Coordinate system:** MediaPipe x is mirrored (`1 - landmark.x`) before projecting to canvas. All mode functions expect this — don't normalize coordinates differently.
- **Color palette:** White-on-black aesthetic. Accent colors come from fingertip identity (spread across the hand) blended with distance-based tension. Avoid introducing new color variables that break the monochrome base.
- **`philosophy.md`** documents the design intent behind the elastic string model, dual-axis color system, and craftsmanship decisions. Read it before making changes to the visual character of any mode.
