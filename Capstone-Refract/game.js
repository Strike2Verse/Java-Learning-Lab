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

/** Draws a single pencil icon (simplified) */
function drawPencil(x, y, rot, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.strokeStyle = C.inkLight;
  ctx.lineWidth = 1.2;
  ctx.lineCap = 'round';
  // Body
  ctx.beginPath();
  ctx.rect(-5, -18, 10, 28);
  ctx.stroke();
  // Tip
  ctx.beginPath();
  ctx.moveTo(-5, 10); ctx.lineTo(0, 20); ctx.lineTo(5, 10);
  ctx.stroke();
  // Eraser
  ctx.fillStyle = 'rgba(180,140,140,0.4)';
  ctx.fillRect(-5, -22, 10, 5);
  ctx.strokeRect(-5, -22, 10, 5);
  ctx.restore();
}

/** Draws a freehand scribble */
function drawScribble(x, y, rot, seed, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.strokeStyle = C.inkLight;
  ctx.lineWidth = 1;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  let sx = 0, sy = 0;
  ctx.moveTo(sx, sy);
  for (let i = 0; i < 6; i++) {
    const angle = seed + i * 1.1;
    sx += Math.cos(angle) * 18;
    sy += Math.sin(angle) * 10;
    ctx.lineTo(sx, sy);
  }
  ctx.stroke();
  ctx.restore();
}

/** Draws the background pencil doodles */
function drawDoodles() {
  for (const d of DOODLES) {
    if (d.type === 'pencil') {
      drawPencil(d.x, d.y, d.rot, 0.18);
    } else {
      drawScribble(d.x, d.y, d.rot, d.seed, 0.18);
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
  ctx.fillText('REFRACT  ·  Phase 1  ·  Use mouse to draw reflector lines', W/2, H - 14);
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

// ── GAME AREA (placeholder for Phase 2+) ────────────────────────────────────
function drawPlaying() {
  // Outer game border (blueprint hatched walls — Phase 2 will flesh this out)
  ctx.save();
  const bx = 60, by = 60, bw = W-120, bh = H-120;
  // Fill
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillRect(bx, by, bw, bh);
  // Hatched border (like reference image 2)
  drawHatchBorder(bx, by, bw, bh, 20);
  // Center text
  ctx.fillStyle    = C.inkMid;
  ctx.font         = `28px 'Architects Daughter', cursive`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Phase 2 — Laser & Hole coming next', W/2, H/2 - 20);
  ctx.fillStyle = C.inkLight;
  ctx.font      = `16px 'Patrick Hand', cursive`;
  ctx.fillText('Press  ESC  to return to menu', W/2, H/2 + 22);
  ctx.restore();
}

/** Hatched diagonal pattern around border (like blueprint reference image walls) */
function drawHatchBorder(bx, by, bw, bh, thickness) {
  ctx.save();
  // Draw hatching
  const HATCH  = 10;
  ctx.strokeStyle = 'rgba(60,100,160,0.25)';
  ctx.lineWidth   = 1;
  // Clip to border region only (uses compositing trick)
  ctx.globalCompositeOperation = 'source-over';
  // Top strip
  hatchStrip(bx, by, bw, thickness);
  // Bottom strip
  hatchStrip(bx, by+bh-thickness, bw, thickness);
  // Left strip
  hatchStrip(bx, by, thickness, bh);
  // Right strip
  hatchStrip(bx+bw-thickness, by, thickness, bh);
  // Outer border line
  ctx.strokeStyle = 'rgba(60,100,160,0.55)';
  ctx.lineWidth   = 2;
  sketchRect(bx, by, bw, bh, 2, 'rgba(60,100,160,0.55)');
  ctx.restore();
}

function hatchStrip(x, y, w, h) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.strokeStyle = 'rgba(60,100,160,0.28)';
  ctx.lineWidth   = 1;
  const span = w + h;
  for (let i = -span; i < span; i += 10) {
    ctx.beginPath();
    ctx.moveTo(x + i, y);
    ctx.lineTo(x + i + h, y + h);
    ctx.stroke();
  }
  ctx.restore();
}

// ── MAIN LOOP ─────────────────────────────────────────────────────────────────
function loop() {
  frame++;
  drawPaper();
  drawGrid();
  drawDoodles();

  if (state === 'MENU') {
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
