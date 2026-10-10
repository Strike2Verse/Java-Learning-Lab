'use strict';

// ═══════════════════════════════════════════════════════════════════════════
//  REFRACT — game.js   Home screen + play area
// ═══════════════════════════════════════════════════════════════════════════

// ── CANVAS ─────────────────────────────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

// Canvas fills the whole browser window; W/H are updated on resize.
let W = window.innerWidth, H = window.innerHeight;
canvas.width  = W;
canvas.height = H;

// ── PALETTE ─────────────────────────────────────────────────────────────────
const C = {
  paper:      '#F6F1E9',   // warm cream paper
  paperEdge:  '#EDE7DA',   // slightly darker near edges
  ink:        '#1E1E1E',   // near-black charcoal
  inkMid:     '#555555',   // mid-gray ink
  inkLight:   '#AAAAAA',   // light pencil
  gridFaint:  'rgba(90, 130, 200, 0.13)',
  gridMajor:  'rgba(90, 130, 200, 0.28)',
  laser:      '#C0392B',   // deep red laser
  laserGlow:  'rgba(192, 57, 43, ',
  accent:     '#C0392B',   // same red as accent
  btnHov:     '#1E1E1E',
};

// ── GAME STATE ───────────────────────────────────────────────────────────────
let state   = 'MENU';   // MENU | PLAYING | HOWTO
let frame   = 0;
let mouse   = { x: 0, y: 0 };

// ── PLAY AREA ─────────────────────────────────────────────────────────────────
// Filled in by layout() so the play area always fits the window.
const WALL_T = 30;                                    // hatched wall thickness
const PLAY   = { x: 0, y: 0, w: 0, h: 0 };            // outer bounds
const INT    = { x: 0, y: 0, w: 0, h: 0 };            // interior (laser zone)
const SOURCE = { x: 0, y: 0 };                        // left wall — laser fires rightward
const HOLE   = { x: 0, y: 0, r: 24 };                 // right wall — goal for the laser
const LEVEL  = { num: 1, speed: 'SLOW', lines: 3 };

// ── PRE-RENDERED PAPER TEXTURE ───────────────────────────────────────────────
const offPaper = document.createElement('canvas');
function buildPaper() {
  offPaper.width  = W;
  offPaper.height = H;
  const pc  = offPaper.getContext('2d');
  // Radial vignette (slightly darker edges for realism)
  const vgr = pc.createRadialGradient(W/2, H/2, H*0.25, W/2, H/2, Math.max(W, H)*0.75);
  vgr.addColorStop(0, C.paper);
  vgr.addColorStop(1, C.paperEdge);
  pc.fillStyle = vgr;
  pc.fillRect(0, 0, W, H);
  // Grain noise
  const id  = pc.getImageData(0, 0, W, H);
  const dat = id.data;
  for (let i = 0; i < dat.length; i += 4) {
    const n = (Math.random() - 0.5) * 14;
    dat[i]   = Math.min(255, Math.max(0, dat[i]   + n));
    dat[i+1] = Math.min(255, Math.max(0, dat[i+1] + n * 0.92));
    dat[i+2] = Math.min(255, Math.max(0, dat[i+2] + n * 0.80));
  }
  pc.putImageData(id, 0, 0);
}

// ── PRE-COMPUTED PENCIL DOODLE POSITIONS (background decoration) ─────────────
let DOODLES = [];
function buildDoodles() {
  const rng = (min, max) => min + Math.random() * (max - min);
  DOODLES = [];
  const zones = [
    [0, 0, W*0.22, H*0.45], [W*0.78, 0, W, H*0.45],    // top corners
    [0, H*0.55, W*0.2, H],  [W*0.8, H*0.55, W, H],     // bottom corners
  ];
  for (const [x1,y1,x2,y2] of zones) {
    for (let i = 0; i < 4; i++) {
      DOODLES.push({
        x:    rng(x1+20, x2-20),
        y:    rng(y1+20, y2-20),
        rot:  rng(-0.8, 0.8),
        type: Math.random() > 0.5 ? 'pencil' : 'scribble',
        seed: Math.random() * 1000,
      });
    }
  }
}

// ── LAYOUT (runs at start and on every window resize) ────────────────────────
function layout() {
  PLAY.x = 60;  PLAY.y = 48;
  PLAY.w = W - 120;  PLAY.h = H - 96;
  INT.x = PLAY.x + WALL_T;        INT.y = PLAY.y + WALL_T;
  INT.w = PLAY.w - WALL_T * 2;    INT.h = PLAY.h - WALL_T * 2;
  SOURCE.x = INT.x;               SOURCE.y = PLAY.y + PLAY.h * 0.56;   // slightly below centre
  HOLE.x   = INT.x + INT.w;       HOLE.y   = PLAY.y + PLAY.h * 0.26;   // upper area — laser misses unless reflected
  buildPaper();
  buildDoodles();
  layoutMenu();
}

let resizeTimer = null;
window.addEventListener('resize', () => {
  W = canvas.width  = window.innerWidth;     // resizing a canvas clears it; loop redraws next frame
  H = canvas.height = window.innerHeight;
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(layout, 120);     // paper texture is heavy — rebuild once resizing stops
});

// ── VECTOR / GEOMETRY ────────────────────────────────────────────────────────
function segmentIntersect(ax,ay,bx,by, cx,cy,dx,dy) {
  const denom = (bx-ax)*(dy-cy)-(by-ay)*(dx-cx);
  if (Math.abs(denom) < 1e-9) return false;
  const t = ((cx-ax)*(dy-cy)-(cy-ay)*(dx-cx)) / denom;
  const u = ((cx-ax)*(by-ay)-(cy-ay)*(bx-ax)) / denom;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

// ── DRAW HELPERS ──────────────────────────────────────────────────────────────
function drawPaper() {
  ctx.drawImage(offPaper, 0, 0, W, H);   // stretched briefly while a resize settles
}

const GRID = 40;
function drawGrid() {
  ctx.save();
  ctx.lineCap = 'square';
  for (let x = 0; x <= W; x += GRID) {
    ctx.strokeStyle = (x/GRID) % 5 === 0 ? C.gridMajor : C.gridFaint;
    ctx.lineWidth   = (x/GRID) % 5 === 0 ? 0.9 : 0.5;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y <= H; y += GRID) {
    ctx.strokeStyle = (y/GRID) % 5 === 0 ? C.gridMajor : C.gridFaint;
    ctx.lineWidth   = (y/GRID) % 5 === 0 ? 0.9 : 0.5;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.restore();
}

/** Draws a single pencil icon — clearly visible, still light */
function drawPencil(x, y, rot, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.strokeStyle = '#888880';  // warm charcoal, slightly warmer than pure grey
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  // Body
  ctx.beginPath();
  ctx.rect(-5, -18, 10, 28);
  ctx.stroke();
  // Wood grain line
  ctx.beginPath();
  ctx.moveTo(0, -18); ctx.lineTo(0, 10);
  ctx.lineWidth = 0.6;
  ctx.stroke();
  // Tip
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(-5, 10); ctx.lineTo(0, 22); ctx.lineTo(5, 10);
  ctx.stroke();
  // Lead tip dot
  ctx.fillStyle = '#555';
  ctx.beginPath();
  ctx.arc(0, 22, 1.2, 0, Math.PI * 2);
  ctx.fill();
  // Eraser (warm pink)
  ctx.fillStyle = 'rgba(200, 150, 140, 0.55)';
  ctx.fillRect(-5, -23, 10, 6);
  ctx.strokeStyle = '#888880';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-5, -23, 10, 6);
  // Eraser band
  ctx.strokeStyle = 'rgba(150, 120, 100, 0.5)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-5, -18); ctx.lineTo(5, -18);
  ctx.stroke();
  ctx.restore();
}

/** Draws a freehand scribble — visible, organic, pencil feel */
function drawScribble(x, y, rot, seed, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.strokeStyle = '#8A8880';
  ctx.lineWidth = 1.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  let sx = 0, sy = 0;
  ctx.moveTo(sx, sy);
  for (let i = 0; i < 7; i++) {
    const angle = seed + i * 1.05;
    sx += Math.cos(angle) * 20;
    sy += Math.sin(angle) * 12;
    ctx.lineTo(sx, sy);
  }
  ctx.stroke();
  ctx.restore();
}

/** Draws the background pencil doodles */
function drawDoodles() {
  for (const d of DOODLES) {
    if (d.type === 'pencil') {
      drawPencil(d.x, d.y, d.rot, 0.30);
    } else {
      drawScribble(d.x, d.y, d.rot, d.seed, 0.25);
    }
  }
}

/** Sketchy hand-drawn rectangle border */
function sketchRect(x, y, w, h, lw, col) {
  ctx.save();
  ctx.strokeStyle = col || C.ink;
  ctx.lineWidth   = lw || 2;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';
  const j = 2.5;  // jitter for hand-drawn feel
  ctx.beginPath();
  ctx.moveTo(x+j,     y);
  ctx.lineTo(x+w-j,   y);
  ctx.lineTo(x+w,     y+j);
  ctx.lineTo(x+w,     y+h-j);
  ctx.lineTo(x+w-j,   y+h);
  ctx.lineTo(x+j,     y+h);
  ctx.lineTo(x,       y+h-j);
  ctx.lineTo(x,       y+j);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

/** Wavy underline drawn with sine curve */
function wavyLine(x1, x2, y, amplitude, col) {
  ctx.save();
  ctx.strokeStyle = col || C.accent;
  ctx.lineWidth   = 2.5;
  ctx.lineCap     = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y);
  const steps = Math.abs(x2 - x1);
  for (let i = 0; i <= steps; i += 4) {
    ctx.lineTo(x1 + i, y + Math.sin((i + frame * 1.4) * 0.05) * amplitude);
  }
  ctx.stroke();
  ctx.restore();
}

/** Button — returns whether hovered */
function drawBtn(x, y, w, h, label, accentCol) {
  const hov = mouse.x>=x && mouse.x<=x+w && mouse.y>=y && mouse.y<=y+h;
  const col = accentCol || C.ink;
  // Drop shadow
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.09)';
  ctx.fillRect(x+4, y+4, w, h);
  // Fill
  ctx.fillStyle = hov ? col : 'rgba(255,255,255,0.82)';
  ctx.fillRect(x, y, w, h);
  ctx.restore();
  // Border
  sketchRect(x, y, w, h, hov ? 3 : 2, col);
  // Label
  ctx.save();
  ctx.fillStyle    = hov ? '#FFFFFF' : col;
  ctx.font         = `bold 18px 'Architects Daughter', cursive`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + w/2, y + h/2 + 1);
  ctx.restore();
  return hov;
}

// ── MENU BEAM (interactive) ──────────────────────────────────────────────────
// The beam bounces around the whole screen. Drag the mirrors to steer it,
// and land it in the GOAL ring. The beam's look is the same one used in-game.
const BEAM_SPEED = 3.2;
const beam    = { x: 0, y: 0, dx: 0, dy: 0, trail: [], maxTrail: 90 };
const mirrors = [];                                // draggable reflector lines
const hit     = { title: 0, play: 0, how: 0 };     // flash timers when the beam touches UI
const goal    = { x: 0, y: 0, r: 30, hits: 0, flash: 0, inside: false };
let   drag    = null;                              // { m, mode: 'move'|'p1'|'p2', ox, oy }
let   hoverMirror = null;

/** Where the menu pieces sit — also used by the beam as obstacles */
function menuRects() {
  const cx = W / 2, ty = Math.max(150, H * 0.30);
  return {
    cx, ty,
    title: { x: cx - 270, y: ty - 90,  w: 540, h: 165 },
    play:  { x: cx - 120, y: ty + 95,  w: 240, h: 58  },
    how:   { x: cx - 120, y: ty + 169, w: 240, h: 50  },
  };
}

function resetBeam() {
  const a = -0.35;
  beam.x = 66;  beam.y = H * 0.62;
  beam.dx = Math.cos(a) * BEAM_SPEED;
  beam.dy = Math.sin(a) * BEAM_SPEED;
  beam.trail = [];
}

function layoutMenu() {
  mirrors.length = 0;
  mirrors.push(
    { x1: W*0.16, y1: H*0.80, x2: W*0.16 + 120, y2: H*0.80 - 100, cd: 0 },
    { x1: W*0.80, y1: H*0.30, x2: W*0.80 + 110, y2: H*0.30 + 90,  cd: 0 },
    { x1: W*0.10, y1: H*0.22, x2: W*0.10 + 110, y2: H*0.22 + 60,  cd: 0 },
  );
  goal.x = W - 110;  goal.y = H * 0.50;
  resetBeam();
}

function reflectOff(m) {
  const nx = -(m.y2 - m.y1), ny = (m.x2 - m.x1);
  const len = Math.hypot(nx, ny);
  const unx = nx / len, uny = ny / len;
  const dot = beam.dx * unx + beam.dy * uny;
  beam.dx -= 2 * dot * unx;
  beam.dy -= 2 * dot * uny;
}

function updateBeam() {
  beam.trail.push({ x: beam.x, y: beam.y });
  if (beam.trail.length > beam.maxTrail) beam.trail.shift();

  const px = beam.x, py = beam.y;
  let nx = px + beam.dx, ny = py + beam.dy;

  // Mirrors
  for (const m of mirrors) {
    if (m.cd > 0) { m.cd--; continue; }
    if (segmentIntersect(px, py, nx, ny, m.x1, m.y1, m.x2, m.y2)) {
      reflectOff(m);
      m.cd = 8;                       // stops double-bounce on the same mirror
      nx = px + beam.dx;  ny = py + beam.dy;
    }
  }

  // Title + buttons act as solid blocks
  const R = menuRects(), PAD = 6;
  for (const key of ['title', 'play', 'how']) {
    const r = R[key];
    const inside = (x, y) => x > r.x - PAD && x < r.x + r.w + PAD && y > r.y - PAD && y < r.y + r.h + PAD;
    if (inside(nx, ny) && !inside(px, py)) {
      const fromSide = px <= r.x - PAD || px >= r.x + r.w + PAD;
      if (fromSide) beam.dx *= -1; else beam.dy *= -1;
      nx = px + beam.dx;  ny = py + beam.dy;
      hit[key] = 1;
    }
  }

  // Screen edges (just inside the rulers)
  const M = 24;
  if (nx < M || nx > W - M) { beam.dx *= -1; nx = Math.max(M, Math.min(W - M, nx)); }
  if (ny < M || ny > H - M) { beam.dy *= -1; ny = Math.max(M, Math.min(H - M, ny)); }

  beam.x = nx;  beam.y = ny;

  // Goal ring: count each time the beam enters it
  const d = Math.hypot(beam.x - goal.x, beam.y - goal.y);
  if (d < goal.r) {
    if (!goal.inside) { goal.hits++; goal.flash = 1; goal.inside = true; }
  } else {
    goal.inside = false;
  }

  for (const k in hit) hit[k] = Math.max(0, hit[k] - 0.04);
  goal.flash = Math.max(0, goal.flash - 0.03);
}

// ── MIRROR DRAGGING ──────────────────────────────────────────────────────────
function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

/** Which mirror (and which part of it) is under the point? */
function pickMirror(px, py) {
  for (const m of mirrors) {
    if (Math.hypot(px - m.x1, py - m.y1) < 16) return { m, mode: 'p1' };
    if (Math.hypot(px - m.x2, py - m.y2) < 16) return { m, mode: 'p2' };
  }
  for (const m of mirrors) {
    if (distToSegment(px, py, m.x1, m.y1, m.x2, m.y2) < 12) return { m, mode: 'move' };
  }
  return null;
}

function clampX(x) { return Math.max(30, Math.min(W - 30, x)); }
function clampY(y) { return Math.max(30, Math.min(H - 30, y)); }

function dragMirror(px, py) {
  const { m, mode } = drag;
  if (mode === 'p1') { m.x1 = clampX(px); m.y1 = clampY(py); }
  else if (mode === 'p2') { m.x2 = clampX(px); m.y2 = clampY(py); }
  else {
    const dx = px - drag.ox, dy = py - drag.oy;
    // Keep both ends on screen
    const mx = Math.min(Math.max(dx, 30 - Math.min(m.x1, m.x2)), W - 30 - Math.max(m.x1, m.x2));
    const my = Math.min(Math.max(dy, 30 - Math.min(m.y1, m.y2)), H - 30 - Math.max(m.y1, m.y2));
    m.x1 += mx; m.x2 += mx; m.y1 += my; m.y2 += my;
    drag.ox = px; drag.oy = py;
  }
  // Keep a minimum length so the mirror can't collapse to a dot
  if (Math.hypot(m.x2 - m.x1, m.y2 - m.y1) < 40) {
    const a = Math.atan2(m.y2 - m.y1, m.x2 - m.x1);
    if (mode === 'p2') { m.x2 = m.x1 + Math.cos(a) * 40; m.y2 = m.y1 + Math.sin(a) * 40; }
    else if (mode === 'p1') { m.x1 = m.x2 - Math.cos(a) * 40; m.y1 = m.y2 - Math.sin(a) * 40; }
  }
}

// ── MENU DRAWING ─────────────────────────────────────────────────────────────
/** Drafting rulers along the top and left edges */
function drawRulers() {
  const T = 18;
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fillRect(0, 0, W, T);
  ctx.fillRect(0, 0, T, H);
  ctx.strokeStyle = 'rgba(55, 95, 155, 0.55)';
  ctx.fillStyle   = 'rgba(55, 95, 155, 0.65)';
  ctx.lineWidth   = 1;
  ctx.font        = `10px 'Patrick Hand', cursive`;
  ctx.textBaseline = 'top';
  ctx.beginPath();
  for (let x = T; x < W; x += 10) {
    const len = (x % 100 === 0) ? 12 : (x % 50 === 0 ? 9 : 5);
    ctx.moveTo(x + 0.5, T); ctx.lineTo(x + 0.5, T - len);
  }
  for (let y = T; y < H; y += 10) {
    const len = (y % 100 === 0) ? 12 : (y % 50 === 0 ? 9 : 5);
    ctx.moveTo(T, y + 0.5); ctx.lineTo(T - len, y + 0.5);
  }
  ctx.moveTo(0, T + 0.5); ctx.lineTo(W, T + 0.5);
  ctx.moveTo(T + 0.5, 0); ctx.lineTo(T + 0.5, H);
  ctx.stroke();
  ctx.textAlign = 'left';
  for (let x = 100; x < W; x += 100) ctx.fillText(x, x + 3, 2);
  ctx.save();
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'right';
  for (let y = 100; y < H; y += 100) ctx.fillText(y, -(y + 3), 2);
  ctx.restore();
  ctx.restore();
}

/** Drafting-sheet title block, bottom-right */
function drawTitleBlock() {
  if (W < 1150) return;
  const w = 230, h = 72, x = W - w - 24, y = H - h - 24;
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(55, 95, 155, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, h);
  ctx.beginPath();
  ctx.moveTo(x, y + 28); ctx.lineTo(x + w, y + 28);
  ctx.moveTo(x + w/2, y + 28); ctx.lineTo(x + w/2, y + h);
  ctx.stroke();
  ctx.fillStyle = C.ink;
  ctx.textAlign = 'center';
  ctx.font = `bold 20px 'Caveat', cursive`;
  ctx.fillText('REFRACT — SHEET 01', x + w/2, y + 20);
  ctx.fillStyle = 'rgba(55, 95, 155, 0.8)';
  ctx.font = `13px 'Patrick Hand', cursive`;
  ctx.fillText('SCALE 1 : 1', x + w/4, y + 54);
  ctx.fillText(`GOAL HITS: ${goal.hits}`, x + w*3/4, y + 54);
  ctx.restore();
}

/** Three little cards that explain the game at a glance */
function drawCards(topY) {
  const cw = 190, ch = 74, gap = 16;
  const x0 = W/2 - (cw*3 + gap*2) / 2;
  const items = [['1', 'AIM',    'drag a mirror'],
                 ['2', 'BOUNCE', 'bend the beam'],
                 ['3', 'SCORE',  'land it in the goal']];
  items.forEach(([n, head, sub], i) => {
    const x = x0 + i * (cw + gap);
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillRect(x, topY, cw, ch);
    ctx.restore();
    sketchRect(x, topY, cw, ch, 1.6, 'rgba(30,30,30,0.55)');
    ctx.save();
    ctx.fillStyle = C.accent;
    ctx.beginPath(); ctx.arc(x + 26, topY + ch/2, 15, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `bold 20px 'Caveat', cursive`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(n, x + 26, topY + ch/2 + 1);
    ctx.fillStyle = C.ink;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = `bold 26px 'Caveat', cursive`;
    ctx.fillText(head, x + 52, topY + 33);
    ctx.fillStyle = C.inkMid;
    ctx.font = `15px 'Patrick Hand', cursive`;
    ctx.fillText(sub, x + 52, topY + 55);
    ctx.restore();
  });
}

/** Laser emitter on the left edge where the beam is born */
function drawEmitter() {
  const y = H * 0.62;
  sketchRect(26, y - 16, 34, 32, 1.8, 'rgba(55, 90, 155, 0.75)');
  ctx.save();
  ctx.fillStyle = 'rgba(55, 90, 155, 0.25)';
  ctx.fillRect(26, y - 16, 34, 32);
  ctx.fillStyle = C.accent;
  ctx.beginPath(); ctx.arc(60, y, 4, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

/** The goal ring — beam passing through it counts a hit */
function drawGoal() {
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.06);
  ctx.save();
  if (goal.flash > 0) {
    ctx.fillStyle = `rgba(192, 57, 43, ${goal.flash * 0.28})`;
    ctx.beginPath(); ctx.arc(goal.x, goal.y, goal.r + 14 * goal.flash, 0, Math.PI*2); ctx.fill();
  }
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 5]);
  ctx.beginPath(); ctx.arc(goal.x, goal.y, goal.r + pulse * 3, 0, Math.PI*2); ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(goal.x, goal.y, goal.r * 0.5, 0, Math.PI*2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(goal.x - goal.r - 10, goal.y); ctx.lineTo(goal.x + goal.r + 10, goal.y);
  ctx.moveTo(goal.x, goal.y - goal.r - 10); ctx.lineTo(goal.x, goal.y + goal.r + 10);
  ctx.stroke();
  ctx.fillStyle = C.ink;
  ctx.textAlign = 'center';
  ctx.font = `bold 22px 'Caveat', cursive`;
  ctx.fillText('GOAL', goal.x, goal.y - goal.r - 18);
  ctx.fillStyle = C.accent;
  ctx.font = `15px 'Patrick Hand', cursive`;
  ctx.fillText(`hits: ${goal.hits}`, goal.x, goal.y + goal.r + 26);
  ctx.restore();
}

/** Draggable mirrors — drawn like the original demo reflector lines */
function drawMirrors() {
  for (const m of mirrors) {
    const active = (drag && drag.m === m) || hoverMirror === m;
    ctx.save();
    ctx.strokeStyle = C.ink;
    ctx.lineWidth   = active ? 3.5 : 2.5;
    ctx.lineCap     = 'round';
    ctx.shadowColor = 'rgba(0,0,0,0.12)';
    ctx.shadowBlur  = 4;
    ctx.beginPath();
    ctx.moveTo(m.x1, m.y1);
    ctx.lineTo(m.x2, m.y2);
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.fillStyle = C.ink;
    ctx.globalAlpha = active ? 0.9 : 0.4;
    const r = active ? 6 : 3;
    ctx.beginPath(); ctx.arc(m.x1, m.y1, r, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(m.x2, m.y2, r, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }
}

/** The beam itself — trail + glowing head (unchanged design) */
function drawBeam() {
  // Laser trail
  ctx.save();
  for (let i = 1; i < beam.trail.length; i++) {
    const t = i / beam.trail.length;
    ctx.strokeStyle = `rgba(192, 57, 43, ${t * 0.55})`;
    ctx.lineWidth   = 1 + t * 1.8;
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.moveTo(beam.trail[i-1].x, beam.trail[i-1].y);
    ctx.lineTo(beam.trail[i].x, beam.trail[i].y);
    ctx.stroke();
  }
  ctx.restore();

  // Laser head glow
  const gr = ctx.createRadialGradient(beam.x, beam.y, 0, beam.x, beam.y, 16);
  gr.addColorStop(0, 'rgba(192, 57, 43, 0.75)');
  gr.addColorStop(1, 'rgba(192, 57, 43, 0)');
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.arc(beam.x, beam.y, 16, 0, Math.PI*2); ctx.fill();
  // Hot core
  ctx.fillStyle = '#FF6B6B';
  ctx.beginPath(); ctx.arc(beam.x, beam.y, 3.5, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.arc(beam.x, beam.y, 1.5, 0, Math.PI*2); ctx.fill();
}

/** Red outline that flares when the beam touches a piece of UI */
function flashRect(r, amount) {
  if (amount <= 0) return;
  ctx.save();
  ctx.strokeStyle = `rgba(192, 57, 43, ${amount})`;
  ctx.lineWidth = 3;
  ctx.strokeRect(r.x - 6, r.y - 6, r.w + 12, r.h + 12);
  ctx.restore();
}

// ── MENU ─────────────────────────────────────────────────────────────────────
function drawMenu() {
  const R = menuRects();
  const cx = R.cx, ty = R.ty;

  // ── Title ──
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font      = `bold 112px 'Caveat', cursive`;
  ctx.fillStyle = 'rgba(0,0,0,0.07)';
  ctx.fillText('REFRACT', cx + 5, ty + 5);
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth   = 4;
  ctx.lineJoin    = 'round';
  ctx.strokeText('REFRACT', cx, ty);
  ctx.fillStyle = C.ink;
  ctx.fillText('REFRACT', cx, ty);
  ctx.restore();

  // Wavy red underline (livelier when the beam hits the title)
  wavyLine(cx - 260, cx + 260, ty + 17, 4 + hit.title * 4, C.accent);

  // Subtitle
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = C.inkMid;
  ctx.font      = `20px 'Patrick Hand', cursive`;
  ctx.fillText('Draw the path.  Bend the light.  Get it in the hole.', cx, ty + 52);
  ctx.restore();
  flashRect(R.title, hit.title);

  // ── Buttons ──
  drawBtn(R.play.x, R.play.y, R.play.w, R.play.h, '▶   PLAY', C.accent);
  drawBtn(R.how.x,  R.how.y,  R.how.w,  R.how.h,  '?   HOW TO PLAY', C.inkMid);
  flashRect(R.play, hit.play);
  flashRect(R.how,  hit.how);

  // Hint under the buttons
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = C.inkMid;
  ctx.font      = `16px 'Patrick Hand', cursive`;
  ctx.fillText('✎ drag the mirrors — steer the beam into the GOAL ring', cx, R.how.y + R.how.h + 34);
  ctx.restore();

  drawCards(H - 120);
  drawTitleBlock();

  // ── Blueprint cross marks ──
  drawCross(46, 46, 14);
  drawCross(W-46, 46, 14);
  drawCross(46, H-46, 14);
  if (W < 1150) drawCross(W-46, H-46, 14);   // title block sits here on wide screens
}

// ── HOW TO PLAY ──────────────────────────────────────────────────────────────
const HOWTO_BACK = () => ({ x: W/2 - 90, y: Math.max(40, H/2 - 240) + 440 + 20, w: 180, h: 46 });

function drawHowTo() {
  const pw = Math.min(760, W - 80), ph = 440;
  const px = W/2 - pw/2, py = Math.max(40, H/2 - ph/2 - 20);
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillRect(px, py, pw, ph);
  ctx.restore();
  sketchRect(px, py, pw, ph, 2.5, C.ink);

  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = C.ink;
  ctx.font = `bold 58px 'Caveat', cursive`;
  ctx.fillText('HOW TO PLAY', W/2, py + 66);
  ctx.restore();
  wavyLine(W/2 - 150, W/2 + 150, py + 80, 3, C.accent);

  const lines = [
    ['A laser beam fires from the emitter on the left wall.',            false],
    ['You can not slow it down or stop it — you only steer it.',         false],
    ['Mirrors (reflector lines) bounce the beam at the matching angle.', false],
    ['Move and rotate the mirrors to change the beam’s direction.',      false],
    ['Guide the beam into the GOAL hole on the right wall.',             true ],
  ];
  ctx.save();
  lines.forEach(([text, strong], i) => {
    const y = py + 140 + i * 52;
    ctx.fillStyle = C.accent;
    ctx.beginPath(); ctx.arc(px + 44, y - 7, 13, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `bold 17px 'Architects Daughter', cursive`;
    ctx.textAlign = 'center';
    ctx.fillText(i + 1, px + 44, y - 1);
    ctx.textAlign = 'left';
    ctx.fillStyle = strong ? C.accent : C.ink;
    ctx.font = `${strong ? 'bold ' : ''}22px 'Patrick Hand', cursive`;
    ctx.fillText(text, px + 72, y);
  });
  ctx.restore();

  const b = HOWTO_BACK();
  drawBtn(b.x, b.y, b.w, b.h, '←   BACK', C.inkMid);
}

/** Cross marker like the ones in the blueprint reference image */
function drawCross(x, y, size) {
  ctx.save();
  ctx.strokeStyle = C.inkLight;
  ctx.lineWidth   = 1.2;
  ctx.lineCap     = 'round';
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.moveTo(x - size, y); ctx.lineTo(x + size, y);
  ctx.moveTo(x, y - size); ctx.lineTo(x, y + size);
  ctx.stroke();
  // Small outer circle
  ctx.beginPath();
  ctx.arc(x, y, size * 0.45, 0, Math.PI*2);
  ctx.stroke();
  ctx.restore();
}

// ── PHASE 2: PLAY AREA ───────────────────────────────────────────────────────
function drawPlaying() {
  drawPlayArea();
  drawStaticLaser();
  drawSource();
  drawHole();
  drawHUD();
}

/** Full play area: interior fill + hatched walls + border */
function drawPlayArea() {
  // Interior fill — slightly brighter than paper
  ctx.fillStyle = 'rgba(255, 252, 245, 0.72)';
  ctx.fillRect(INT.x, INT.y, INT.w, INT.h);

  drawInteriorDots();
  drawBlueprintAnnotations();

  // Hatched wall strips (blueprint style)
  hatchStrip(PLAY.x,                    PLAY.y,                     PLAY.w,  WALL_T);        // top
  hatchStrip(PLAY.x,                    PLAY.y + PLAY.h - WALL_T,   PLAY.w,  WALL_T);        // bottom
  hatchStrip(PLAY.x,                    PLAY.y,                     WALL_T,  PLAY.h);        // left
  hatchStrip(PLAY.x + PLAY.w - WALL_T,  PLAY.y,                     WALL_T,  PLAY.h);        // right

  // Outer border — solid sketchy line
  sketchRect(PLAY.x, PLAY.y, PLAY.w, PLAY.h, 2.5, 'rgba(55, 95, 155, 0.65)');
  // Inner border — thinner
  ctx.save();
  ctx.strokeStyle = 'rgba(55, 95, 155, 0.30)';
  ctx.lineWidth   = 1;
  ctx.strokeRect(INT.x, INT.y, INT.w, INT.h);
  ctx.restore();

  // Blueprint corner squares (decorative, like technical drawings)
  blueprintCorner(PLAY.x,              PLAY.y);
  blueprintCorner(PLAY.x + PLAY.w,     PLAY.y);
  blueprintCorner(PLAY.x,              PLAY.y + PLAY.h);
  blueprintCorner(PLAY.x + PLAY.w,     PLAY.y + PLAY.h);
}

/** Hatched diagonal strip clipped to a rectangle */
function hatchStrip(x, y, w, h) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.strokeStyle = 'rgba(55, 100, 165, 0.22)';
  ctx.lineWidth   = 1;
  const span = w + h;
  for (let i = -span; i < span; i += 11) {
    ctx.beginPath();
    ctx.moveTo(x + i,     y);
    ctx.lineTo(x + i + h, y + h);
    ctx.stroke();
  }
  ctx.restore();
}

/** Small filled square at each corner of the play area border */
function blueprintCorner(x, y) {
  ctx.save();
  ctx.fillStyle   = 'rgba(55, 100, 165, 0.45)';
  ctx.strokeStyle = 'rgba(55, 100, 165, 0.70)';
  ctx.lineWidth   = 1;
  ctx.fillRect(x - 5, y - 5, 10, 10);
  ctx.strokeRect(x - 5, y - 5, 10, 10);
  ctx.restore();
}

/** Laser SOURCE emitter — blueprint/pencil sketch style */
function drawSource() {
  const sx = SOURCE.x, sy = SOURCE.y;
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.07);

  // Laser energy glow (soft red — the output energy coming out)
  const glow = ctx.createRadialGradient(sx + 4, sy, 0, sx + 4, sy, 20 + pulse * 5);
  glow.addColorStop(0,  `rgba(200, 80, 60, ${0.22 + pulse * 0.10})`);
  glow.addColorStop(1,   'rgba(200, 80, 60, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(sx + 4, sy, 20 + pulse * 5, 0, Math.PI * 2);
  ctx.fill();

  // Body — blueprint style (light blue-white fill, blueprint blue stroke)
  ctx.save();
  ctx.strokeStyle = 'rgba(55, 90, 155, 0.70)';
  ctx.lineWidth   = 1.8;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';
  // Main body
  ctx.fillStyle = 'rgba(225, 232, 245, 0.75)';
  ctx.fillRect(sx - 22, sy - 11, 22, 22);
  ctx.strokeRect(sx - 22, sy - 11, 22, 22);
  // Internal cross detail (technical drawing)
  ctx.strokeStyle = 'rgba(55, 90, 155, 0.30)';
  ctx.lineWidth   = 0.8;
  ctx.beginPath();
  ctx.moveTo(sx - 22, sy); ctx.lineTo(sx, sy);       // mid horizontal
  ctx.moveTo(sx - 11, sy - 11); ctx.lineTo(sx - 11, sy + 11); // mid vertical
  ctx.stroke();
  // Diagonal hatch on back half
  ctx.save();
  ctx.beginPath();
  ctx.rect(sx - 22, sy - 11, 11, 22);
  ctx.clip();
  ctx.strokeStyle = 'rgba(55, 90, 155, 0.18)';
  ctx.lineWidth = 0.7;
  for (let i = -30; i < 30; i += 6) {
    ctx.beginPath();
    ctx.moveTo(sx - 22 + i, sy - 11);
    ctx.lineTo(sx - 22 + i + 22, sy + 11);
    ctx.stroke();
  }
  ctx.restore();
  // Nozzle tip (triangle, blueprint fill)
  ctx.strokeStyle = 'rgba(55, 90, 155, 0.70)';
  ctx.lineWidth   = 1.8;
  ctx.fillStyle   = 'rgba(210, 220, 240, 0.85)';
  ctx.beginPath();
  ctx.moveTo(sx,      sy - 8);
  ctx.lineTo(sx + 14, sy);
  ctx.lineTo(sx,      sy + 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Hot energy dot at nozzle tip
  ctx.fillStyle = `rgba(240, 100, 75, ${0.80 + pulse * 0.20})`;
  ctx.beginPath();
  ctx.arc(sx + 6, sy, 3.5 + pulse * 1.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(255, 240, 230, ${0.7 + pulse * 0.2})`;
  ctx.beginPath();
  ctx.arc(sx + 6, sy, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Label (blueprint annotation style)
  ctx.save();
  ctx.fillStyle   = 'rgba(55, 90, 155, 0.65)';
  ctx.font        = `10px 'Patrick Hand', cursive`;
  ctx.textAlign   = 'center';
  ctx.fillText('SOURCE', sx - 11, sy + 22);
  // Small annotation line
  ctx.strokeStyle = 'rgba(55, 90, 155, 0.35)';
  ctx.lineWidth   = 0.8;
  ctx.beginPath();
  ctx.moveTo(sx - 22, sy + 16); ctx.lineTo(sx, sy + 16);
  ctx.stroke();
  ctx.restore();
}

/** HOLE goal — pencil/paper sketch style (cross-hatched, not dark void) */
function drawHole() {
  const hx = HOLE.x, hy = HOLE.y, hr = HOLE.r;
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.05 + 1.2);

  // Warm paper shadow (matches paper tone — not black glow)
  const smudge = ctx.createRadialGradient(hx + 2, hy + 3, 0, hx + 2, hy + 3, hr + 14);
  smudge.addColorStop(0,  `rgba(110, 95, 70, ${0.18 + pulse * 0.06})`);
  smudge.addColorStop(1,   'rgba(110, 95, 70, 0)');
  ctx.fillStyle = smudge;
  ctx.beginPath();
  ctx.arc(hx + 2, hy + 3, hr + 14, 0, Math.PI * 2);
  ctx.fill();

  // Light fill (paper tone, slightly darker than background)
  ctx.fillStyle = 'rgba(200, 192, 175, 0.65)';
  ctx.beginPath();
  ctx.arc(hx, hy, hr, 0, Math.PI * 2);
  ctx.fill();

  // Cross-hatching inside (pencil fill — diagonal lines)
  ctx.save();
  ctx.beginPath();
  ctx.arc(hx, hy, hr - 1, 0, Math.PI * 2);
  ctx.clip();
  ctx.strokeStyle = 'rgba(70, 62, 52, 0.20)';
  ctx.lineWidth = 0.9;
  const span = hr * 2 + 10;
  for (let i = -span; i < span; i += 7) {
    ctx.beginPath();
    ctx.moveTo(hx - hr + i, hy - hr); ctx.lineTo(hx - hr + i + hr * 2, hy + hr); ctx.stroke();
  }
  // Second hatch direction
  ctx.strokeStyle = 'rgba(70, 62, 52, 0.12)';
  for (let i = -span; i < span; i += 7) {
    ctx.beginPath();
    ctx.moveTo(hx + hr - i, hy - hr); ctx.lineTo(hx + hr - i - hr * 2, hy + hr); ctx.stroke();
  }
  ctx.restore();

  // Outer sketchy circle (main border — ink pen style)
  ctx.save();
  ctx.strokeStyle = 'rgba(40, 36, 30, 0.75)';
  ctx.lineWidth   = 2.2;
  ctx.beginPath();
  ctx.arc(hx, hy, hr, 0, Math.PI * 2);
  ctx.stroke();
  // Second outer ring (hand-drawn double-circle look)
  ctx.strokeStyle = 'rgba(40, 36, 30, 0.28)';
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.arc(hx, hy, hr + 7, 0, Math.PI * 2);
  ctx.stroke();
  // Inner ring
  ctx.strokeStyle = 'rgba(40, 36, 30, 0.50)';
  ctx.lineWidth   = 1.2;
  ctx.beginPath();
  ctx.arc(hx, hy, hr * 0.5, 0, Math.PI * 2);
  ctx.stroke();
  // Centre dot
  ctx.fillStyle = 'rgba(40, 36, 30, 0.60)';
  ctx.beginPath();
  ctx.arc(hx, hy, 3, 0, Math.PI * 2);
  ctx.fill();
  // Small cross at centre (technical target)
  ctx.strokeStyle = 'rgba(40, 36, 30, 0.45)';
  ctx.lineWidth   = 0.8;
  ctx.beginPath();
  ctx.moveTo(hx - 8, hy); ctx.lineTo(hx + 8, hy);
  ctx.moveTo(hx, hy - 8); ctx.lineTo(hx, hy + 8);
  ctx.stroke();
  ctx.restore();

  // Label (blueprint annotation style)
  ctx.save();
  ctx.fillStyle   = 'rgba(55, 90, 155, 0.65)';
  ctx.font        = `10px 'Patrick Hand', cursive`;
  ctx.textAlign   = 'center';
  ctx.fillText('GOAL', hx, hy - hr - 10);
  // Annotation leader line
  ctx.strokeStyle = 'rgba(55, 90, 155, 0.35)';
  ctx.lineWidth   = 0.8;
  ctx.beginPath();
  ctx.moveTo(hx - 16, hy - hr - 5); ctx.lineTo(hx + 16, hy - hr - 5);
  ctx.stroke();
  ctx.restore();
}

/** Static laser beam — fires RIGHT from source, hits right wall */
function drawStaticLaser() {
  const sx = SOURCE.x + 10,  sy = SOURCE.y;
  const ex = INT.x + INT.w,  ey = sy;   // hits right wall at same height
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.06);

  // Wide soft glow pass
  ctx.save();
  ctx.strokeStyle = `rgba(192, 57, 43, ${0.12 + pulse * 0.06})`;
  ctx.lineWidth   = 18;
  ctx.lineCap     = 'round';
  ctx.beginPath();
  ctx.moveTo(sx, sy); ctx.lineTo(ex, ey);
  ctx.stroke();

  // Mid glow
  ctx.strokeStyle = `rgba(210, 70, 50, ${0.25 + pulse * 0.10})`;
  ctx.lineWidth   = 7;
  ctx.beginPath();
  ctx.moveTo(sx, sy); ctx.lineTo(ex, ey);
  ctx.stroke();

  // Core beam
  ctx.strokeStyle = `rgba(230, 90, 70, ${0.75 + pulse * 0.15})`;
  ctx.lineWidth   = 2;
  ctx.beginPath();
  ctx.moveTo(sx, sy); ctx.lineTo(ex, ey);
  ctx.stroke();

  // Hot white centre
  ctx.strokeStyle = `rgba(255, 220, 210, ${0.6 + pulse * 0.2})`;
  ctx.lineWidth   = 0.8;
  ctx.beginPath();
  ctx.moveTo(sx, sy); ctx.lineTo(ex, ey);
  ctx.stroke();
  ctx.restore();

  // Wall-impact spark (where laser hits the right wall — NOT the hole)
  const spark = 0.5 + 0.5 * Math.sin(frame * 0.14);
  const sg = ctx.createRadialGradient(ex, ey, 0, ex, ey, 12 + spark * 5);
  sg.addColorStop(0,   `rgba(255, 180, 100, ${0.7 + spark * 0.2})`);
  sg.addColorStop(0.5, `rgba(220,  80,  40, ${0.4 + spark * 0.1})`);
  sg.addColorStop(1,    'rgba(192,  57,  43, 0)');
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.arc(ex, ey, 12 + spark * 5, 0, Math.PI * 2);
  ctx.fill();

  // Hint annotation: laser missing hole
  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.setLineDash([4, 5]);
  ctx.lineWidth = 1;
  // Dashed vertical guide from laser Y to hole Y
  ctx.beginPath();
  ctx.moveTo(ex - 60, ey);
  ctx.lineTo(ex - 60, HOLE.y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = C.inkLight;
  ctx.font      = `12px 'Patrick Hand', cursive`;
  ctx.textAlign = 'center';
  ctx.fillText('← draw a reflector line to redirect!', INT.x + INT.w * 0.52, sy - 14);
  ctx.restore();
}

/** HUD strip below the play area */
function drawHUD() {
  const hx = PLAY.x, hy = PLAY.y + PLAY.h + 8;
  const hw = PLAY.w;

  ctx.save();
  ctx.fillStyle    = C.inkMid;
  ctx.font         = `13px 'Patrick Hand', cursive`;
  ctx.textBaseline = 'top';

  // Left: level
  ctx.textAlign = 'left';
  ctx.fillText(`LEVEL  ${LEVEL.num}`, hx, hy);

  // Centre: speed
  ctx.textAlign = 'center';
  ctx.fillStyle = C.inkLight;
  ctx.fillText(`SPEED: ${LEVEL.speed}`, hx + hw / 2, hy);

  // Right: lines remaining + ESC tip
  ctx.textAlign = 'right';
  ctx.fillStyle = C.inkMid;
  ctx.fillText(`LINES: ${LEVEL.lines}   ·   ESC = menu`, hx + hw, hy);
  ctx.restore();
}

/** Faint notebook ruled lines (menu only) — like lined paper */
function drawRuledLines() {
  ctx.save();
  // Horizontal rules
  ctx.strokeStyle = 'rgba(120, 140, 200, 0.055)';
  ctx.lineWidth   = 0.5;
  for (let y = 28; y < H; y += 28) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  // Faint red margin line (left side, like a composition book)
  ctx.strokeStyle = 'rgba(190, 100, 90, 0.07)';
  ctx.lineWidth   = 1;
  ctx.beginPath(); ctx.moveTo(72, 0); ctx.lineTo(72, H); ctx.stroke();
  ctx.restore();
}

/** Faint dot grid inside play area interior */
function drawInteriorDots() {
  ctx.save();
  ctx.fillStyle = 'rgba(90, 120, 180, 0.16)';
  const DOT_STEP = 40;
  for (let x = INT.x + 20; x < INT.x + INT.w - 10; x += DOT_STEP) {
    for (let y = INT.y + 20; y < INT.y + INT.h - 10; y += DOT_STEP) {
      ctx.beginPath();
      ctx.arc(x, y, 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** Blueprint measurement ticks + annotation on play area walls */
function drawBlueprintAnnotations() {
  ctx.save();
  ctx.strokeStyle = 'rgba(55, 90, 155, 0.35)';
  ctx.fillStyle   = 'rgba(55, 90, 155, 0.50)';
  ctx.lineWidth   = 0.8;
  ctx.font        = `9px 'Patrick Hand', cursive`;
  ctx.textAlign   = 'center';
  // Top wall ticks (every 200px)
  for (let x = INT.x; x <= INT.x + INT.w; x += 200) {
    ctx.beginPath();
    ctx.moveTo(x, PLAY.y + WALL_T - 4);
    ctx.lineTo(x, PLAY.y + WALL_T + 4);
    ctx.stroke();
  }
  // Left wall ticks
  for (let y = INT.y; y <= INT.y + INT.h; y += 150) {
    ctx.beginPath();
    ctx.moveTo(PLAY.x + WALL_T - 4, y);
    ctx.lineTo(PLAY.x + WALL_T + 4, y);
    ctx.stroke();
  }
  // Small level label stamp in top-left corner of interior
  ctx.textAlign   = 'left';
  ctx.fillStyle   = 'rgba(55, 90, 155, 0.30)';
  ctx.font        = `10px 'Patrick Hand', cursive`;
  ctx.fillText(`LVL-0${LEVEL.num}`, INT.x + 6, INT.y + 6);
  // Top-right corner: grid ref
  ctx.textAlign   = 'right';
  ctx.fillText('GRID-A', INT.x + INT.w - 6, INT.y + 6);
  ctx.restore();
}

// ── MAIN LOOP ─────────────────────────────────────────────────────────────────
function loop() {
  frame++;
  drawPaper();
  drawGrid();

  if (state === 'MENU') {
    drawRulers();
    drawDoodles();
    drawEmitter();
    drawGoal();
    drawMenu();
    drawMirrors();
    updateBeam();
    drawBeam();
  } else if (state === 'HOWTO') {
    drawRulers();
    drawDoodles();
    drawHowTo();
  } else if (state === 'PLAYING') {
    drawDoodles();
    drawPlaying();
  }

  // Cursor reflects what is under the mouse
  let cur = 'default';
  if (state === 'PLAYING') cur = 'crosshair';
  else if (state === 'MENU') {
    const R = menuRects();
    if (drag) cur = 'grabbing';
    else if (hoverMirror) cur = 'grab';
    else if (inRect(mouse, R.how)) cur = 'pointer';
  } else if (state === 'HOWTO') {
    if (inRect(mouse, HOWTO_BACK())) cur = 'pointer';
  }
  canvas.style.cursor = cur;

  requestAnimationFrame(loop);
}

// ── INPUT ─────────────────────────────────────────────────────────────────────
function toCanvas(e) {
  const r = canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
}

function inRect(p, r) {
  return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}

canvas.addEventListener('pointermove', e => {
  const p = toCanvas(e);
  mouse.x = p.x;  mouse.y = p.y;
  if (state !== 'MENU') return;
  if (drag) dragMirror(p.x, p.y);
  else { const pk = pickMirror(p.x, p.y); hoverMirror = pk ? pk.m : null; }
});

canvas.addEventListener('pointerdown', e => {
  const p = toCanvas(e);
  mouse.x = p.x;  mouse.y = p.y;
  if (state !== 'MENU') return;
  const pk = pickMirror(p.x, p.y);
  if (pk) {
    drag = { m: pk.m, mode: pk.mode, ox: p.x, oy: p.y };
    canvas.setPointerCapture(e.pointerId);
  }
});

canvas.addEventListener('pointerup', () => { drag = null; });

canvas.addEventListener('click', e => {
  const p = toCanvas(e);
  if (state === 'MENU') {
    const R = menuRects();
    // PLAY does nothing yet — the play screen will be connected later
    if (inRect(p, R.how)) state = 'HOWTO';
  } else if (state === 'HOWTO') {
    if (inRect(p, HOWTO_BACK())) state = 'MENU';
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && state !== 'MENU') state = 'MENU';
});

// ── START ─────────────────────────────────────────────────────────────────────
layout();
requestAnimationFrame(loop);
