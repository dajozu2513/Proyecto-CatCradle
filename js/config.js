// ── Hand landmark indices ────────────────────────────
const TIPS = [4, 8, 12, 16, 20];
const BONES = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17],[0,17],
];

// ── Color palette (luminance only) ───────────────────
const CW = [255, 255, 255];   // bright white
const CD = [180, 180, 180];   // dim white
const CF = [100, 100, 100];   // faint white

// ── Default parameters ───────────────────────────────
const DEF = { glow:20, trail:200, vmix:0.50, lw:1.8, sag:0.16, dot:7, spd:1.0 };
let P = {...DEF};

// ── Active mode index ────────────────────────────────
let mode = 5;
