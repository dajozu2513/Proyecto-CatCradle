# CatCradle

Real-time generative art web application using hand tracking. Uses Google MediaPipe for landmark detection and p5.js for canvas rendering. No build step required — just open `index.html` directly in the browser.

---

## Technologies

| Library | Version | Purpose |
|---|---|---|
| MediaPipe Hands | 0.4.1646424915 | Detects 21 landmarks per hand |
| MediaPipe Camera Utils | 0.3.1640029074 | Webcam integration |
| p5.js | 1.9.4 | Canvas rendering at 60 fps |

All dependencies load from a CDN — no `npm install` required.

## Requirements

- Modern browser with WebRTC support (Chrome, Edge, Firefox, Safari 14+)
- Webcam
- No backend server needed

## How to Use

1. Open `index.html` in the browser
2. Grant camera permission when prompted by the browser
3. Place one or two hands in front of the camera
4. Switch modes using the buttons in the side panel
5. Adjust parameters with the sliders

## Visualization Modes

| Mode | Description |
|---|---|
| **Neural Web** | Bipartite K₅,₅ graph between fingertips with elastic bézier curves |
| **Helix** | Twin spirals between the centers of both hands |
| **Sigil Gate** | Rotating concentric polygons forming a mandala |
| **Circuit** | Orthogonal paths with animated particle traces |
| **Vortex** | Concentric ellipses spiraling in rotation |
| **Constellation** | Proximity graph connecting nearby fingertips |

## Adjustable Parameters (side panel)

`glow` · `trail opacity` · `video mix` · `line weight` · `sag/wobble` · `dot size` · `anim speed`

## Architecture

All the code lives in `index.html`, organized into three blocks:

- **CSS** — design tokens, HUD layout, controls panel
- **HTML** — webcam `<video>` element, HUD, buttons and sliders panel
- **JavaScript** — `initMP()` initializes MediaPipe; `setup()`/`draw()` form the p5.js cycle; `lx()`/`ly()` transform coordinates; six independent mode functions

The global `P` object holds all live parameters. Sliders write directly to `P`; modes read from `P` every frame.

---

Design philosophy: `philosophy.md`
