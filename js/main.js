// ── State ────────────────────────────────────────────
let handResults = null;
let hands = [];
const vid = document.getElementById('video');
let T = 0;
let menuOpen = false;

// ═══════════════════════════════════════════════════════
//  P5 SKETCH
// ═══════════════════════════════════════════════════════
function setup() {
  let c = createCanvas(windowWidth, windowHeight);
  c.elt.style.zIndex = '1';
  colorMode(RGB, 255, 255, 255, 255);
  frameRate(60);
  buildModeGrid();
}

function draw() {
  T += 0.016 * P.spd;

  noStroke(); fill(14, 14, 13, P.trail);
  rect(0, 0, width, height);

  if (vid.readyState >= 2) {
    push();
    translate(width, 0); scale(-1, 1);
    drawingContext.globalAlpha = P.vmix;
    drawingContext.drawImage(vid, 0, 0, width, height);
    drawingContext.globalAlpha = 1;
    pop();
  }

  drawGrid();

  hands = handResults?.multiHandLandmarks ?? [];
  syncHandUI(hands.length);

  if      (hands.length >= 2) MODES[mode].fn(hands[0], hands[1]);
  else if (hands.length === 1) MODES[mode].fn(hands[0], null);
  for (const h of hands) { drawBones(h); drawDots(h); }
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }

// ═══════════════════════════════════════════════════════
//  MEDIAPIPE
// ═══════════════════════════════════════════════════════
function initMP() {
  const tracker = new Hands({
    locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${f}`,
  });
  tracker.setOptions({ maxNumHands:2, modelComplexity:1,
    minDetectionConfidence:0.65, minTrackingConfidence:0.55 });
  tracker.onResults(r => { handResults = r; });

  new Camera(vid, {
    onFrame: async () => { await tracker.send({ image: vid }); },
    width:1280, height:720,
  }).start()
    .then(()  => setCamOK(true))
    .catch(e  => { setCamOK(false); console.error(e); });
}

// ═══════════════════════════════════════════════════════
//  UI HANDLERS
// ═══════════════════════════════════════════════════════
function setCamOK(ok) {
  const cls = ok ? 'ok' : 'err';
  const txt = ok ? 'Camera active' : 'Camera error';
  document.getElementById('h-cam').className   = 'hdot ' + cls;
  document.getElementById('p-sdot').className  = 'sdot ' + cls;
  document.getElementById('h-cam-txt').textContent = txt;
  document.getElementById('p-stxt').textContent    = txt;
}

function syncHandUI(n) {
  document.getElementById('h-h1').className = 'hdot' + (n>=1?' on':'');
  document.getElementById('h-h2').className = 'hdot' + (n>=2?' on':'');
  document.getElementById('p-p1').className = 'p-pip' + (n>=1?' on':'');
  document.getElementById('p-p2').className = 'p-pip' + (n>=2?' on':'');
  const t = n + ' hand' + (n!==1?'s':'') + ' detected';
  document.getElementById('h-hands').textContent = t;
  document.getElementById('p-htxt').textContent  = t;
}

function toggleMenu() {
  menuOpen = !menuOpen;
  document.getElementById('panel').classList.toggle('open', menuOpen);
  document.getElementById('menu-btn').textContent = menuOpen ? '✕ Close' : '≡ Menu';
}

function buildModeGrid() {
  const grid = document.getElementById('mode-grid');
  MODES.forEach((m,i) => {
    const b = document.createElement('button');
    b.className = 'mbtn' + (i===mode?' sel':'');
    b.innerHTML = m.label.replace('\n','<br>');
    b.onclick = () => selectMode(i);
    grid.appendChild(b);
  });
}

function selectMode(i) {
  mode = i;
  document.querySelectorAll('.mbtn').forEach((b,j) => b.classList.toggle('sel', j===i));
  document.getElementById('mode-label').textContent = MODES[i].label.replace('\n',' ');
}

function sp(key, val, dispId) {
  P[key] = val;
  document.getElementById(dispId).textContent = val;
}

function screenshot() {
  try {
    const c = document.querySelector('canvas');
    const a = document.createElement('a');
    a.download = 'catscradle-' + Date.now() + '.png';
    a.href = c.toDataURL('image/png');
    a.click();
  } catch(e) { console.warn('Screenshot blocked:', e); }
}

function resetP() {
  P = {...DEF};
  [['s-glow','v-glow','glow'],['s-trail','v-trail','trail'],
   ['s-vmix','v-vmix','vmix'],['s-lw','v-lw','lw'],
   ['s-sag','v-sag','sag'],['s-dot','v-dot','dot'],
   ['s-spd','v-spd','spd']].forEach(([sid,vid,key]) => {
     document.getElementById(sid).value = P[key];
     document.getElementById(vid).textContent = P[key];
  });
}

window.addEventListener('load', initMP);
