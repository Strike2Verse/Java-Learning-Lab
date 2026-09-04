'use strict';

// ═══════════════════════════════════════════════════════════════════════════
//  REFRACT — game.js   Phase 1: Title Screen & Paper Theme
// ═══════════════════════════════════════════════════════════════════════════

// ── CANVAS ─────────────────────────────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

const W = 1200, H = 750;
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
const PLAY  = { x: 60,  y: 48,  w: 1080, h: 654 };  // outer bounds
const WALL_T = 30;                                    // hatched wall thickness
const INT   = {                                       // interior (laser zone)
  x: PLAY.x + WALL_T,
  y: PLAY.y + WALL_T,
  w: PLAY.w - WALL_T * 2,
  h: PLAY.h - WALL_T * 2,
};

// ── LEVEL DATA ────────────────────────────────────────────────────────────────
// SOURCE: left wall — laser fires rightward
const SOURCE = {
  x: INT.x,
  y: PLAY.y + PLAY.h * 0.56,   // slightly below centre
};
// HOLE: right wall — goal the laser must enter
const HOLE = {
  x: INT.x + INT.w,
  y: PLAY.y + PLAY.h * 0.26,   // upper area — laser misses unless reflected
  r: 24,                        // hole radius
};
const LEVEL = { num: 1, speed: 'SLOW', lines: 3 };

// ── PRE-RENDERED PAPER TEXTURE ───────────────────────────────────────────────
const offPaper = document.createElement('canvas');
offPaper.width  = W;
offPaper.height = H;
(function buildPaper() {
  const pc  = offPaper.getContext('2d');
  // Radial vignette (slightly darker edges for realism)
  const vgr = pc.createRadialGradient(W/2, H/2, H*0.25, W/2, H/2, H*0.85);
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
})();

// ── PRE-COMPUTED PENCIL DOODLE POSITIONS (background decoration) ─────────────
const DOODLES = (function() {
  const rng = (min, max) => min + Math.random() * (max - min);
  const items = [];
  const zones = [
    [0, 0, 260, 340], [W-260, 0, W, 340],    // top corners
    [0, 400, 220, H],  [W-220, 400, W, H],   // bottom corners
  ];
  for (const [x1,y1,x2,y2] of zones) {
    for (let i = 0; i < 4; i++) {
      items.push({
        x:    rng(x1+20, x2-20),
        y:    rng(y1+20, y2-20),
        rot:  rng(-0.8, 0.8),
        type: Math.random() > 0.5 ? 'pencil' : 'scribble',
        seed: Math.random() * 1000,
      });
    }
  }
  return items;
})();

// ── DEMO LASER (bouncing on title screen) ────────────────────────────────────
const demo = {
  x: 160, y: 500,
  dx: 2.8, dy: -1.6,
  trail: [],
  maxTrail: 90,
  // reflector lines shown on title for demo
  lines: [
    { x1: 440, y1: 580, x2: 540, y2: 480 },   // '\' style
    { x1: 700, y1: 460, x2: 800, y2: 560 },   // '/' style
  ],
};

const DEMO_AREA = { x1: 60, y1: 430, x2: W - 60, y2: H - 30 };

function updateDemo() {
  demo.trail.push({ x: demo.x, y: demo.y });
  if (demo.trail.length > demo.maxTrail) demo.trail.shift();

  // Check reflection against demo lines
  for (const ln of demo.lines) {
    if (segmentIntersect(
          demo.x, demo.y,
          demo.x + demo.dx * 8, demo.y + demo.dy * 8,
          ln.x1, ln.y1, ln.x2, ln.y2)) {
      const nx = -(ln.y2 - ln.y1), ny = (ln.x2 - ln.x1);
      const len = Math.hypot(nx, ny);
      const nnx = nx / len, nny = ny / len;
      const dot = demo.dx * nnx + demo.dy * nny;
      demo.dx -= 2 * dot * nnx;
      demo.dy -= 2 * dot * nny;
      break;
    }
  }

  demo.x += demo.dx;
  demo.y += demo.dy;

  // Bounce off demo area walls
  if (demo.x < DEMO_AREA.x1 || demo.x > DEMO_AREA.x2) demo.dx *= -1;
  if (demo.y < DEMO_AREA.y1 || demo.y > DEMO_AREA.y2) demo.dy *= -1;
  demo.x = Math.max(DEMO_AREA.x1, Math.min(DEMO_AREA.x2, demo.x));
  demo.y = Math.max(DEMO_AREA.y1, Math.min(DEMO_AREA.y2, demo.y));
}

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
  ctx.drawImage(offPaper, 0, 0);
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

// ── DEMO LASER RENDERING ─────────────────────────────────────────────────────
function drawDemo() {
  // Draw the two reflector lines for the demo
  for (const ln of demo.lines) {
    ctx.save();
    ctx.strokeStyle = C.ink;
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = 'round';
    // Glow
    ctx.shadowColor = 'rgba(0,0,0,0.12)';
    ctx.shadowBlur  = 4;
    ctx.beginPath();
    ctx.moveTo(ln.x1, ln.y1);
    ctx.lineTo(ln.x2, ln.y2);
    ctx.stroke();
    ctx.restore();
    // Small circles at endpoints
    ctx.save();
    ctx.fillStyle   = C.ink;
    ctx.globalAlpha = 0.4;
    ctx.beginPath(); ctx.arc(ln.x1, ln.y1, 3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(ln.x2, ln.y2, 3, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  }

  // Label
  ctx.save();
  ctx.fillStyle    = C.inkLight;
  ctx.font         = `13px 'Patrick Hand', cursive`;
  ctx.textAlign    = 'center';
  ctx.fillText('↑ live laser preview — this is what gameplay looks like', W/2, DEMO_AREA.y2 - 8);
  ctx.restore();

  // Laser trail
  ctx.save();
  for (let i = 1; i < demo.trail.length; i++) {
    const t = i / demo.trail.length;
    ctx.strokeStyle = `rgba(192, 57, 43, ${t * 0.55})`;
    ctx.lineWidth   = 1 + t * 1.8;
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.moveTo(demo.trail[i-1].x, demo.trail[i-1].y);
    ctx.lineTo(demo.trail[i].x, demo.trail[i].y);
    ctx.stroke();
  }
  ctx.restore();

  // Laser head glow
  const gr = ctx.createRadialGradient(demo.x, demo.y, 0, demo.x, demo.y, 16);
  gr.addColorStop(0, 'rgba(192, 57, 43, 0.75)');
  gr.addColorStop(1, 'rgba(192, 57, 43, 0)');
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.arc(demo.x, demo.y, 16, 0, Math.PI*2); ctx.fill();
  // Hot core
  ctx.fillStyle = '#FF6B6B';
  ctx.beginPath(); ctx.arc(demo.x, demo.y, 3.5, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.arc(demo.x, demo.y, 1.5, 0, Math.PI*2); ctx.fill();
}

// ── MENU ─────────────────────────────────────────────────────────────────────
function drawMenu() {
  // ── Title ──
  ctx.save();
  ctx.textAlign = 'center';

  // Title shadow
  ctx.font      = `bold 112px 'Caveat', cursive`;
  ctx.fillStyle = 'rgba(0,0,0,0.07)';
  ctx.fillText('REFRACT', W/2 + 5, 198);

  // Title stroke (outline effect)
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  ctx.lineWidth   = 4;
  ctx.lineJoin    = 'round';
  ctx.strokeText('REFRACT', W/2, 193);

  // Title fill
  ctx.fillStyle = C.ink;
  ctx.fillText('REFRACT', W/2, 193);
  ctx.restore();

  // Wavy red underline below title
  const titleW = 520;
  wavyLine(W/2 - titleW/2, W/2 + titleW/2, 210, 4, C.accent);

  // Subtitle
  ctx.save();
  ctx.textAlign    = 'center';
  ctx.fillStyle    = C.inkMid;
  ctx.font         = `20px 'Patrick Hand', cursive`;
  ctx.fillText('Draw the path.  Bend the light.  Get it in the hole.', W/2, 245);
  ctx.restore();

  // Pencil rule line
  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,0.10)';
  ctx.lineWidth   = 1.5;
  ctx.lineCap     = 'round';
  ctx.beginPath();
  ctx.moveTo(W/2 - 340, 272);
  for (let i = 0; i <= 680; i += 6) {
    ctx.lineTo(W/2 - 340 + i, 272 + Math.sin(i * 0.09 + frame*0.02) * 1.8);
  }
  ctx.stroke();
  ctx.restore();

  // ── Buttons ──
  drawBtn(W/2 - 120, 290, 240, 58, '▶   PLAY', C.accent);
  drawBtn(W/2 - 120, 366, 240, 50, '?   HOW TO PLAY', C.inkMid);

  // ── Small labels beside buttons ──
  ctx.save();
  ctx.fillStyle = C.inkLight;
  ctx.font      = `12px 'Patrick Hand', cursive`;
  ctx.textAlign = 'left';
  ctx.fillText('← click to start', W/2 + 128, 323);
  ctx.restore();

  // ── Corner markers (like blueprint cross marks from ref image) ──
  drawCross(50, 50, 14);
  drawCross(W-50, 50, 14);
  drawCross(50, H-50, 14);
  drawCross(W-50, H-50, 14);

  // ── Footer ──
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = C.inkLight;
  ctx.font      = `12px 'Patrick Hand', cursive`;
  ctx.fillText('REFRACT  ·  Phase 2  ·  Use mouse to draw reflector lines', W/2, H - 14);
  ctx.restore();
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
  drawDoodles();

  if (state === 'MENU') {
    drawRuledLines();
    updateDemo();
    drawDemo();
    drawMenu();
  } else if (state === 'PLAYING') {
    drawPlaying();
  }

  // Change cursor style based on state
  canvas.style.cursor = state === 'PLAYING' ? 'crosshair' : 'default';

  requestAnimationFrame(loop);
}

// ── INPUT ─────────────────────────────────────────────────────────────────────
canvas.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect();
  mouse.x = (e.clientX - r.left) * (W / r.width);
  mouse.y = (e.clientY - r.top)  * (H / r.height);
});

canvas.addEventListener('click', e => {
  const r = canvas.getBoundingClientRect();
  const mx = (e.clientX - r.left) * (W / r.width);
  const my = (e.clientY - r.top)  * (H / r.height);

  if (state === 'MENU') {
    // PLAY button: x=W/2-120, y=290, w=240, h=58
    if (mx >= W/2-120 && mx <= W/2+120 && my >= 290 && my <= 348) {
      state = 'PLAYING';
    }
    // HOW TO button: y=366, h=50
    if (mx >= W/2-120 && mx <= W/2+120 && my >= 366 && my <= 416) {
      // Phase 5 will implement this
    }
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && state !== 'MENU') state = 'MENU';
});

// ── START ─────────────────────────────────────────────────────────────────────
requestAnimationFrame(loop);
