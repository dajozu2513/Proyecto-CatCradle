// ── Coordinate helpers ───────────────────────────────
const lx = lm => (1 - lm.x) * width;
const ly = lm => lm.y * height;

function center(h) {
  let sx=0, sy=0;
  for (const lm of h) { sx+=lx(lm); sy+=ly(lm); }
  return { x: sx/h.length, y: sy/h.length };
}

// ── Background grid ──────────────────────────────────
function drawGrid() {
  const step = 55;
  stroke(255, 255, 255, 5); strokeWeight(0.4);
  for (let x=0; x<width;  x+=step) line(x,0,x,height);
  for (let y=0; y<height; y+=step) line(0,y,width,y);
}

// ── Glow helpers ─────────────────────────────────────
function glow(col, blur) {
  drawingContext.shadowBlur  = blur;
  drawingContext.shadowColor = `rgb(${col[0]},${col[1]},${col[2]})`;
}
function noGlow() { drawingContext.shadowBlur = 0; }

// ── Bezier stroke helper ──────────────────────────────
function bezier2(ax,ay,cpx,cpy,bx,by) {
  beginShape(); vertex(ax,ay); quadraticVertex(cpx,cpy,bx,by); endShape();
}

// ── Skeleton rendering ────────────────────────────────
function drawBones(h) {
  glow(CF, P.glow * 0.25);
  stroke(255, 255, 255, 22); strokeWeight(0.6); noFill();
  for (const [a,b] of BONES) line(lx(h[a]),ly(h[a]),lx(h[b]),ly(h[b]));
  noGlow();
}

function drawDots(h) {
  noStroke();
  const pulse = 1 + 0.18 * Math.sin(T * 5.5);
  for (let i=0; i<h.length; i++) {
    const x=lx(h[i]), y=ly(h[i]);
    const tip = TIPS.includes(i);
    const r   = tip ? P.dot * pulse : P.dot * 0.4;

    glow(CW, P.glow * (tip ? 1.3 : 0.45));
    fill(255, 255, 255, tip ? 210 : 120);
    circle(x, y, r * 2);

    if (tip) {
      glow(CW, P.glow * 0.4); fill(255, 255, 255, 240);
      circle(x, y, r * 0.52);
    }
    noGlow();
  }
}

// ═══════════════════════════════════════════════════════
//  MODE 0 — NEURAL WEB
// ═══════════════════════════════════════════════════════
function modeNeuralWeb(h0, h1) {
  const pairs = [];
  if (h1) {
    for (let ai=0; ai<TIPS.length; ai++)
      for (let bi=0; bi<TIPS.length; bi++)
        pairs.push([h0[TIPS[ai]], h1[TIPS[bi]], ai, bi]);
  } else {
    for (let ai=0; ai<TIPS.length; ai++)
      for (let bi=ai+1; bi<TIPS.length; bi++)
        pairs.push([h0[TIPS[ai]], h0[TIPS[bi]], ai, bi]);
  }

  for (const [A, B, ai, bi] of pairs) {
    const ax=lx(A), ay=ly(A), bx=lx(B), by=ly(B);
    const d   = Math.hypot(bx-ax, by-ay);
    const ten = Math.min(d / (Math.hypot(width,height) * 0.52), 1);

    const mx=(ax+bx)*0.5, my=(ay+by)*0.5;
    const len=d||1;
    const nx=-(by-ay)/len, ny=(bx-ax)/len;
    const sag = d * P.sag * Math.sin(T*3 + ai*1.37 + bi*0.91);
    const cpx=mx+nx*sag, cpy=my+ny*sag;

    const sw = map(ten, 0, 1, P.lw, P.lw * 0.18);
    const al = map(ten, 0, 1, 190, 50);

    glow(CW, P.glow * 0.85);
    stroke(255, 255, 255, al * 0.22); strokeWeight(sw + 5); noFill();
    bezier2(ax,ay,cpx,cpy,bx,by);
    glow(CW, P.glow * 0.3);
    stroke(255, 255, 255, al); strokeWeight(sw);
    bezier2(ax,ay,cpx,cpy,bx,by);
    noGlow();
  }
}

// ═══════════════════════════════════════════════════════
//  MODE 1 — DOUBLE HELIX
// ═══════════════════════════════════════════════════════
function modeHelix(h0, h1) {
  const c0 = h1 ? center(h0) : { x:lx(h0[0]),  y:ly(h0[0])  };
  const c1 = h1 ? center(h1) : { x:lx(h0[12]), y:ly(h0[12]) };

  const dx=c1.x-c0.x, dy=c1.y-c0.y;
  const axLen = Math.hypot(dx,dy)||1;
  const px=-dy/axLen, py=dx/axLen;

  const STEPS=120, TWISTS=6;
  const amp = axLen * 0.09;
  const s0=[], s1=[];

  for (let i=0; i<=STEPS; i++) {
    const tt = i/STEPS;
    const bx = c0.x + dx*tt, by = c0.y + dy*tt;
    const ang = TWISTS * TWO_PI * tt + T * 2.2;
    const off = Math.cos(ang) * amp;
    s0.push({ x: bx + px*off, y: by + py*off });
    s1.push({ x: bx - px*off, y: by - py*off });
  }

  const drawStrand = (pts, al) => {
    glow(CW, P.glow);
    stroke(255, 255, 255, al); strokeWeight(P.lw); noFill();
    beginShape();
    for (const p of pts) vertex(p.x,p.y);
    endShape();
    noGlow();
  };
  drawStrand(s0, 200);
  drawStrand(s1, 120);

  const interval = Math.max(2, Math.floor(STEPS / (TWISTS * 2)));
  for (let i=interval; i<STEPS; i+=interval) {
    const p0=s0[i], p1=s1[i];
    glow(CW, P.glow * 0.5);
    stroke(255,255,255,90); strokeWeight(P.lw * 0.55);
    line(p0.x,p0.y,p1.x,p1.y);
    noStroke(); fill(255,255,255,170);
    circle(p0.x,p0.y,4); circle(p1.x,p1.y,4);
    noGlow();
  }
}

// ═══════════════════════════════════════════════════════
//  MODE 2 — SIGIL GATE
// ═══════════════════════════════════════════════════════
function modeSigilGate(h0, h1) {
  const c0=center(h0), c1=h1 ? center(h1) : { x:lx(h0[9]), y:ly(h0[9]) };
  const cx=(c0.x+c1.x)*0.5, cy=(c0.y+c1.y)*0.5;
  const dist = h1 ? Math.hypot(c1.x-c0.x, c1.y-c0.y)
                  : Math.hypot(lx(h0[12])-lx(h0[0]), ly(h0[12])-ly(h0[0])) * 1.4;
  const R = dist * 0.38;
  const r0=T*0.45, r1=-T*0.65;

  const poly = (n, r, rot, al, sw_=P.lw*0.65) => {
    glow(CW, P.glow * 0.8);
    stroke(255,255,255,al); strokeWeight(sw_); noFill();
    beginShape();
    for (let i=0; i<=n; i++) {
      const a = rot + TWO_PI*i/n - HALF_PI;
      vertex(cx+cos(a)*r, cy+sin(a)*r);
    }
    endShape();
    noGlow();
  };

  const star = (n, r1_, r2, rot, al) => {
    glow(CW, P.glow);
    stroke(255,255,255,al); strokeWeight(P.lw*0.55); noFill();
    beginShape();
    for (let i=0; i<=n*2; i++) {
      const a = rot + TWO_PI*i/(n*2) - HALF_PI;
      const r = (i%2===0) ? r1_ : r2;
      vertex(cx+cos(a)*r, cy+sin(a)*r);
    }
    endShape();
    noGlow();
  };

  glow(CW, P.glow*0.4); stroke(255,255,255,50); strokeWeight(P.lw*0.4); noFill();
  circle(cx,cy,R*2.15); noGlow();

  star(5, R*0.95, R*0.4,  r0,     145);
  poly(6, R*0.68,          r1,     100);
  poly(3, R*0.55,          r0*1.6,  85);
  star(4, R*0.32, R*0.15, r1*2.1,  165);

  glow(CW, P.glow*0.25); stroke(255,255,255,35); strokeWeight(P.lw*0.3);
  for (let i=0; i<10; i++) {
    const a = r0 + TWO_PI*i/10 - HALF_PI;
    line(cx,cy, cx+cos(a)*R*0.92, cy+sin(a)*R*0.92);
  }
  noGlow();

  glow(CW, P.glow*1.8); noStroke(); fill(255,255,255,230); circle(cx,cy,7); noGlow();

  glow(CW, P.glow*0.3); stroke(255,255,255,28); strokeWeight(P.lw*0.3);
  for (const h of [h0, h1].filter(Boolean)) {
    for (const ti of TIPS) line(cx,cy, lx(h[ti]), ly(h[ti]));
  }
  noGlow();
}

// ═══════════════════════════════════════════════════════
//  MODE 3 — CIRCUIT TRACE
// ═══════════════════════════════════════════════════════
function modeCircuit(h0, h1) {
  if (h1) {
    for (let i=0; i<TIPS.length; i++) {
      const A=h0[TIPS[i]], B=h1[TIPS[i]];
      const ax=lx(A), ay=ly(A), bx=lx(B), by=ly(B);
      const kx=(ax+bx)*0.5;

      glow(CW, P.glow*0.6);
      stroke(255,255,255,110); strokeWeight(P.lw); noFill();
      line(ax,ay, kx,ay); line(kx,ay, kx,by); line(kx,by, bx,by);
      noGlow();

      const ps=P.dot*0.7;
      glow(CW, P.glow*0.9); fill(255,255,255,170); noStroke();
      rect(ax-ps/2,ay-ps/2,ps,ps); rect(bx-ps/2,by-ps/2,ps,ps);
      fill(255,255,255,130);
      circle(kx,ay,ps*0.65); circle(kx,by,ps*0.65);
      noGlow();

      const seg1=Math.abs(kx-ax), seg2=Math.abs(by-ay), seg3=Math.abs(bx-kx);
      const total=(seg1+seg2+seg3)||1;
      const pOff=((T*90+i*35)%total);
      let ppx=ax, ppy=ay;
      if (pOff<seg1)           { ppx=ax+(kx-ax)*(pOff/seg1); ppy=ay; }
      else if (pOff<seg1+seg2) { ppx=kx; ppy=ay+(by-ay)*((pOff-seg1)/(seg2||1)); }
      else                     { ppx=kx+(bx-kx)*((pOff-seg1-seg2)/(seg3||1)); ppy=by; }
      glow(CW, P.glow*2); noStroke(); fill(255,255,255,245); circle(ppx,ppy,4); noGlow();
    }
    const w0=h0[0], w1=h1[0];
    glow(CW,P.glow*0.25); stroke(255,255,255,20); strokeWeight(P.lw*0.3);
    line(lx(w0),ly(w0),lx(w1),ly(w1)); noGlow();
  } else {
    const wx=lx(h0[0]), wy=ly(h0[0]);
    for (let i=0; i<TIPS.length; i++) {
      const ax=lx(h0[TIPS[i]]), ay=ly(h0[TIPS[i]]);
      const kx=wx, ky=ay;

      glow(CW, P.glow*0.6);
      stroke(255,255,255,110); strokeWeight(P.lw); noFill();
      line(wx,wy, kx,ky); line(kx,ky, ax,ay);
      noGlow();

      const ps=P.dot*0.7;
      glow(CW,P.glow*0.9); fill(255,255,255,165); noStroke();
      rect(ax-ps/2,ay-ps/2,ps,ps);
      fill(255,255,255,125); circle(kx,ky,ps*0.65); noGlow();

      const seg1=Math.abs(ky-wy), seg2=Math.abs(ax-kx);
      const total=(seg1+seg2)||1;
      const pOff=((T*90+i*35)%total);
      let ppx=wx, ppy=wy;
      if (pOff<seg1) { ppx=wx; ppy=wy+(ky-wy)*(pOff/seg1); }
      else           { ppx=kx+(ax-kx)*((pOff-seg1)/(seg2||1)); ppy=ky; }
      glow(CW,P.glow*2); noStroke(); fill(255,255,255,245); circle(ppx,ppy,4); noGlow();
    }
    const ps=P.dot*0.9;
    glow(CW,P.glow); fill(255,255,255,175); noStroke();
    rect(wx-ps/2,wy-ps/2,ps,ps); noGlow();
  }
}

// ═══════════════════════════════════════════════════════
//  MODE 4 — VORTEX PORTAL
// ═══════════════════════════════════════════════════════
function modeVortex(h0, h1) {
  const c0 = center(h0);
  const c1 = h1 ? center(h1) : { x:lx(h0[12]), y:ly(h0[12]) };
  const cx=(c0.x+c1.x)*0.5, cy=(c0.y+c1.y)*0.5;
  const dist = Math.hypot(c1.x-c0.x, c1.y-c0.y);
  const axAngle = Math.atan2(c1.y-c0.y, c1.x-c0.x) + HALF_PI;
  const maxR = dist * 0.58;
  const RINGS = 16;

  push(); translate(cx,cy); rotate(axAngle);
  for (let i=RINGS; i>=1; i--) {
    const tr    = i/RINGS;
    const ringR = maxR * tr;
    const squish = 0.28 + tr*0.14;
    const rotOff = T * 0.9 * (i%2===0 ? 1 : -1);
    const al    = map(i,1,RINGS, 230, 30);
    const sw    = map(i,1,RINGS, P.lw*1.3, P.lw*0.22);

    glow(CW, P.glow * 0.6 * tr);
    stroke(255,255,255,al); strokeWeight(sw); noFill();
    push(); rotate(rotOff);
    ellipse(0,0, ringR*2, ringR*2*squish);
    pop();
    noGlow();
  }
  glow(CW, P.glow*2); noStroke(); fill(255,255,255,230); circle(0,0,P.dot*1.8); noGlow();
  pop();

  for (const c of (h1 ? [c0,c1] : [c0])) {
    glow(CW,P.glow*0.35); stroke(255,255,255,45); strokeWeight(P.lw*0.35);
    line(c.x,c.y,cx,cy); noGlow();
  }
}

// ═══════════════════════════════════════════════════════
//  MODE 5 — CONSTELLATION
// ═══════════════════════════════════════════════════════
function modeConstellation(h0, h1) {
  const nodes = h1
    ? [ ...TIPS.map(i => ({ x:lx(h0[i]), y:ly(h0[i]) })),
        ...TIPS.map(i => ({ x:lx(h1[i]), y:ly(h1[i]) })) ]
    : TIPS.map(i => ({ x:lx(h0[i]), y:ly(h0[i]) }));

  const closeD = Math.hypot(width,height) * 0.12;

  for (let a=0; a<nodes.length; a++) {
    for (let b=a+1; b<nodes.length; b++) {
      const d    = Math.hypot(nodes[b].x-nodes[a].x, nodes[b].y-nodes[a].y);
      const al   = max(65, map(d, 0, closeD, 175, 65));
      const sw   = max(P.lw*0.22, map(d, 0, closeD, P.lw*0.9, P.lw*0.3));
      const pulse = (sin(T*2.2 + a*0.6 + b*0.4) + 1) * 0.5;

      glow(CW, P.glow * 0.4 * pulse);
      stroke(255,255,255, al*(0.55 + 0.45*pulse));
      strokeWeight(sw);
      line(nodes[a].x,nodes[a].y, nodes[b].x,nodes[b].y);
      noGlow();
    }
  }

  for (const n of nodes) {
    const s = P.dot * 0.9;
    glow(CW, P.glow*0.85);
    stroke(255,255,255,185); strokeWeight(0.7); noFill();
    line(n.x-s,n.y,   n.x+s,n.y);
    line(n.x,  n.y-s, n.x,  n.y+s);
    line(n.x-s*.55,n.y,   n.x,n.y-s*.55);
    line(n.x,n.y-s*.55,   n.x+s*.55,n.y);
    line(n.x+s*.55,n.y,   n.x,n.y+s*.55);
    line(n.x,n.y+s*.55,   n.x-s*.55,n.y);
    noGlow();
    glow(CW,P.glow*0.45); noStroke(); fill(255,255,255,195); circle(n.x,n.y,2.5); noGlow();
  }

  const wrists = h1 ? [h0[0],h1[0]] : [h0[0]];
  glow(CW,P.glow*0.2); stroke(255,255,255,15); strokeWeight(P.lw*0.22);
  for (const n of nodes)
    for (const w of wrists) line(n.x,n.y,lx(w),ly(w));
  noGlow();
}

// ── Mode registry ─────────────────────────────────────
const MODES = [
  { label:'Neural\nWeb',       fn: modeNeuralWeb    },
  { label:'Double\nHelix',     fn: modeHelix        },
  { label:'Sigil\nGate',       fn: modeSigilGate    },
  { label:'Circuit\nTrace',    fn: modeCircuit      },
  { label:'Vortex\nPortal',    fn: modeVortex       },
  { label:'Constel-\nlation',  fn: modeConstellation},
];
