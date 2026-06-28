# CatCradle

Aplicación web de arte generativo en tiempo real mediante rastreo de manos. Usa Google MediaPipe para detección de landmarks y p5.js para renderizado en canvas. Sin build step — abre `index.html` directamente en el browser.

---

## Tecnologías

| Librería | Versión | Uso |
|---|---|---|
| MediaPipe Hands | 0.4.1646424915 | Detección de 21 landmarks por mano |
| MediaPipe Camera Utils | 0.3.1640029074 | Integración con webcam |
| p5.js | 1.9.4 | Renderizado canvas a 60 fps |

Todas las dependencias cargan desde CDN — no requiere `npm install`.

## Requisitos

- Browser moderno con soporte WebRTC (Chrome, Edge, Firefox, Safari 14+)
- Cámara web
- Ningún servidor backend

## Cómo usar

1. Abre `index.html` en el browser
2. Concede permiso de cámara cuando el browser lo solicite
3. Coloca una o dos manos frente a la cámara
4. Cambia de modo con los botones del panel lateral
5. Ajusta parámetros con los sliders

## Modos de visualización

| Modo | Descripción |
|---|---|
| **Neural Web** | Grafo bipartito K₅,₅ entre yemas con curvas bézier elásticas |
| **Helix** | Espirales gemelas entre centros de las manos |
| **Sigil Gate** | Polígonos concéntricos rotantes formando mandala |
| **Circuit** | Caminos ortogonales con trazas de partículas animadas |
| **Vortex** | Elipses concéntricas girando en espiral |
| **Constellation** | Grafo de proximidad conectando yemas cercanas |

## Parámetros ajustables (panel lateral)

`glow` · `trail opacity` · `video mix` · `line weight` · `sag/wobble` · `dot size` · `anim speed`

## Arquitectura

Todo el código vive en `index.html` organizado en tres bloques:

- **CSS** — design tokens, layout del HUD, panel de controles
- **HTML** — elemento `<video>` de webcam, HUD, panel de botones y sliders
- **JavaScript** — `initMP()` inicializa MediaPipe; `setup()`/`draw()` es el ciclo p5.js; `lx()`/`ly()` transforman coordenadas; seis funciones de modo independientes

El objeto global `P` contiene todos los parámetros vivos. Los sliders escriben directo en `P`; los modos leen de `P` cada frame.

---

Filosofía de diseño: `philosophy.md`
