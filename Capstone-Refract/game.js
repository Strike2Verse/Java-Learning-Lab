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
let state   = 'MENU';   // MENU | LEVELS | PLAYING | HOWTO
let frame   = 0;
let mouse   = { x: 0, y: 0 };

// ── PLAY AREA ─────────────────────────────────────────────────────────────────
// Filled in by layout() so the play area always fits the window.
const WALL_T = 30;                                    // hatched wall thickness
const PLAY   = { x: 0, y: 0, w: 0, h: 0 };            // outer bounds
const INT    = { x: 0, y: 0, w: 0, h: 0 };            // interior (laser zone)
const SOURCE = { x: 0, y: 0 };                        // left wall — laser fires rightward
const HOLE   = { x: 0, y: 0, r: 24 };                 // right wall — goal for the laser
// Levels are generated at random (see generateLevel) — only the number of levels
// and the tile rules are fixed. tiles / maxLen are the same on every level:
// max 3 tiles at once, each at most 120px long.
const TOTAL_LEVELS = 8;
let   levelSpec    = null;   // layout of the level being played (kept when the window is resized)
const LEVEL  = { num: 1, speed: 'SLOW', v: 1.4, tiles: 3, maxLen: 120 };

// ── SOUND ────────────────────────────────────────────────────────────────────
// Every sound is synthesised with the Web Audio API — no audio files. All notes
// come from one pentatonic scale, so whatever the beam does always sounds
// musical: bounces play a walking melody, stars climb the scale, and a looping
// background song (bass, arpeggio, melody, drums) plays underneath — it gets
// faster, changes key and adds more layers as the levels go up. Press M to mute.
const sfx = (() => {
  let ac = null, master = null, echo = null;
  let muted = false;
  try { muted = localStorage.getItem('refractMuted') === '1'; } catch (e) { /* storage blocked — stay unmuted */ }

  const SCALE = [0, 2, 4, 7, 9];                         // major pentatonic (semitones)
  const ROOT  = 261.63;                                  // middle C
  const noteHz = i => ROOT * 2 ** ((SCALE[i % 5] + 12 * Math.floor(i / 5)) / 12);
  const lastPlayed = {};

  /** Browsers only allow audio after a click or key press — call this from one */
  function unlock() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    master = ac.createGain();
    master.gain.value = muted ? 0 : 0.55;
    master.connect(ac.destination);

    // A soft echo that every sound can send some of itself into
    const delay = ac.createDelay();   delay.delayTime.value = 0.24;
    const fb    = ac.createGain();    fb.gain.value  = 0.33;
    const wet   = ac.createGain();    wet.gain.value = 0.3;
    const dull  = ac.createBiquadFilter();  dull.type = 'lowpass';  dull.frequency.value = 2200;
    echo = ac.createGain();
    echo.connect(delay);  delay.connect(dull);
    dull.connect(fb);  fb.connect(delay);
    dull.connect(wet); wet.connect(master);
  }

  /** false if audio is off or this sound played too recently (stops machine-gun repeats) */
  function ready(name, gap) {
    if (!ac || muted) return false;
    const t = ac.currentTime;
    if (lastPlayed[name] !== undefined && t - lastPlayed[name] < gap) return false;
    lastPlayed[name] = t;
    return true;
  }

  /** One note: quick fade-in, exponential fade-out, optional pitch glide and echo send */
  function tone({ f, glide, type = 'sine', at = 0, dur = 0.3, vol = 0.2, send = 0.5, to = master }) {
    const t0 = ac.currentTime + Math.max(0, at);
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t0);
    if (glide) o.frequency.exponentialRampToValueAtTime(glide, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);  g.connect(to);
    if (send) { const s = ac.createGain(); s.gain.value = send; g.connect(s); s.connect(echo); }
    o.start(t0);  o.stop(t0 + dur + 0.05);
  }

  /** Glassy bell: the note plus a quiet octave and a quieter fifth above it */
  function bell(f, at = 0, vol = 0.18, dur = 0.55, send = 0.5, to = master) {
    tone({ f,           at, dur,        vol,        send, to });
    tone({ f: f * 2,    at, dur: dur * 0.6, vol: vol * 0.35, send, to });
    tone({ f: f * 3,    at, dur: dur * 0.3, vol: vol * 0.12, send, to });
  }

  /** Short burst of filtered noise — gives the thud its body */
  function thump(at, dur, vol, cutoff, kind = 'lowpass', to = master) {
    const n = Math.floor(ac.sampleRate * dur);
    const buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = ac.createBufferSource(), lp = ac.createBiquadFilter(), g = ac.createGain();
    src.buffer = buf;  lp.type = kind;  lp.frequency.value = cutoff;  g.gain.value = vol;
    src.connect(lp);  lp.connect(g);  g.connect(to);
    src.start(ac.currentTime + Math.max(0, at));
  }

  // ── Background song ──────────────────────────────────────────────────────
  // A four-bar loop (Am – F – C – G) built from eighth-note steps and scheduled
  // slightly ahead of time so the rhythm stays steady. Higher levels play it
  // faster, in a higher key, and add layers: melody (2+), hi-hat (3+), kick (4+).
  const PROGRESSION = [                                   // semitones above the key's C: [bass note, three chord tones]
    [9, [9, 12, 16]],                                     // Am
    [5, [5,  9, 12]],                                     // F
    [0, [0,  4,  7]],                                     // C
    [7, [7, 11, 14]],                                     // G
  ];
  const KEY_SHIFT = [0, 0, 2, 2, 3, 5, 5, 7];             // key change per level
  const ARP       = [0, 1, 2, 1, 2, 1, 0, 1];             // which chord tone each eighth note plays
  let song = null;                                        // { next, step, level, ducked, timer }
  let bus  = null;                                        // all music goes through here (volume / ducking)

  const keyHz = (semi, level) => ROOT * 2 ** ((semi + KEY_SHIFT[(level - 1) % KEY_SHIFT.length]) / 12);

  function playStep(step, t, level) {
    const at   = t - ac.currentTime;
    const bar  = Math.floor(step / 8) % PROGRESSION.length;
    const i    = step % 8;
    const [bassSemi, chord] = PROGRESSION[bar];

    // Bass: root on beats 1 and 3, a lighter note on the off-beat in between
    if (i === 0 || i === 4) {
      const f = keyHz(bassSemi, level) / 2;
      tone({ f, type: 'triangle', at, dur: 0.55, vol: 0.3,  send: 0.1, to: bus });
      tone({ f: f * 2, type: 'sine', at, dur: 0.3, vol: 0.08, send: 0.1, to: bus });
    } else if (i === 6) {
      tone({ f: keyHz(bassSemi + 7, level) / 2, type: 'triangle', at, dur: 0.25, vol: 0.14, send: 0.1, to: bus });
    }

    // Arpeggio: the chord tones going round — the part that carries the tune
    const tone2 = chord[ARP[i]] + (i === 7 && Math.random() < 0.4 ? 12 : 0);   // sometimes sparkles an octave up
    tone({ f: keyHz(tone2, level) * 2, type: 'triangle', at, dur: 0.38, vol: 0.12, send: 0.35, to: bus });

    // Melody (level 2+): a few random notes from the pentatonic scale, mostly on the strong steps
    if (level >= 2 && (i === 0 || i === 3 || i === 6) && Math.random() < 0.6) {
      bell(keyHz(SCALE[Math.floor(Math.random() * 5)] + 12, level) * 2, at, 0.1, 0.7, 0.6, bus);
    }

    // Hi-hat on the off-beats (level 3+), kick on beats 1 and 3 (level 4+)
    if (level >= 3 && i % 2 === 1) thump(at, 0.05, 0.1, 6500, 'highpass', bus);
    if (level >= 4 && (i === 0 || i === 4)) {
      tone({ f: 150, glide: 45, at, dur: 0.18, vol: 0.4, send: 0, to: bus });
    }
  }

  function tick() {
    if (!song) return;
    const now = ac.currentTime;
    if (song.next < now - 0.1) song.next = now + 0.05;    // tab was in the background — skip ahead instead of catching up
    while (song.next < now + 0.25) {
      playStep(song.step, song.next, song.level);
      song.next += 60 / (80 + 7 * (song.level - 1)) / 2;  // 80 bpm on level 1, 129 bpm on level 8
      song.step++;
    }
  }

  /** Keeps the song running: pass the level it should sound like and whether to turn it down (win fanfare) */
  function music(level, ducked) {
    if (!ac) return;
    if (!song) {
      bus = ac.createGain();  bus.gain.value = 0;  bus.connect(master);
      song = { next: ac.currentTime + 0.1, step: 0, level, timer: setInterval(tick, 60) };
    }
    song.level = level;
    bus.gain.setTargetAtTime(ducked ? 0.18 : 0.7, ac.currentTime, 0.25);
  }

  return {
    unlock, music,
    isMuted: () => muted,

    toggle() {
      muted = !muted;
      try { localStorage.setItem('refractMuted', muted ? '1' : '0'); } catch (e) { /* ignore */ }
      if (master) master.gain.setTargetAtTime(muted ? 0 : 0.55, ac.currentTime, 0.05);
      if (!muted) { unlock(); bell(noteHz(7), 0, 0.14, 0.3); }
    },

    /** Beam bounces off a tile: n = how many bounces this shot has made, so the notes walk up and down */
    bounce(n) {
      if (!ready('bounce', 0.05)) return;
      bell(noteHz(5 + [0, 2, 1, 3, 2, 4, 3, 5][n % 8]), 0, 0.17, 0.6);
    },

    /** Beam leaves the source */
    fire() {
      if (!ready('fire', 0.1)) return;
      tone({ f: 1100, glide: 320, type: 'triangle', dur: 0.16, vol: 0.05, send: 0.2 });
    },

    /** Beam absorbed by stone / wall: a soft thud and a falling note */
    miss() {
      if (!ready('miss', 0.1)) return;
      tone({ f: 190, glide: 55, dur: 0.28, vol: 0.28, send: 0.15 });
      thump(0, 0.14, 0.18, 700);
    },

    /** Beam reached the goal before collecting every star */
    denied() {
      if (!ready('denied', 0.2)) return;
      tone({ f: 330, type: 'triangle', at: 0.04, dur: 0.18, vol: 0.12, send: 0.3 });
      tone({ f: 247, type: 'triangle', at: 0.2,  dur: 0.3,  vol: 0.12, send: 0.3 });
    },

    /** Star collected: k = how many stars this level are already collected, each one higher up the scale */
    star(k) {
      if (!ready('star', 0.05)) return;
      const i = 7 + Math.min(k, 3) * 2;
      bell(noteHz(i), 0, 0.16, 0.5);
      bell(noteHz(i + 2), 0.08, 0.12, 0.7);
    },

    /** Beam jumps through a portal: a quick upward whoosh */
    portal() {
      if (!ready('portal', 0.15)) return;
      tone({ f: 240, glide: 1300, dur: 0.24, vol: 0.09, send: 0.6 });
      tone({ f: 400, glide: 1800, type: 'triangle', at: 0.03, dur: 0.22, vol: 0.05, send: 0.6 });
    },

    /** Player finishes drawing a tile: longer tile, higher pluck */
    tile(len) {
      if (!ready('tile', 0.05)) return;
      bell(noteHz(2 + Math.round(Math.min(len, 120) / 120 * 4)), 0, 0.1, 0.22, 0.25);
    },

    /** Level solved. The last level gets a longer, higher fanfare */
    win(allClear) {
      if (!ac || muted) return;
      const run = allClear ? [0, 2, 4, 6, 7, 9, 10, 12] : [0, 2, 4, 6, 8];   // steps up the scale, from the high C
      run.forEach((step, k) => bell(noteHz(5 + step), k * 0.1, 0.17, 0.9, 0.6));
      const end = run.length * 0.1;
      [0, 4, 7, 12].forEach(semi =>                                            // closing C-major chord
        tone({ f: ROOT * 2 * 2 ** (semi / 12), at: end, dur: allClear ? 2.4 : 1.4, vol: 0.09, send: 0.7 }));
    },

    /** Button pressed */
    click() {
      if (!ready('click', 0.05)) return;
      bell(noteHz(7), 0, 0.1, 0.18, 0.2);
    },

    /** Menu beam touches a mirror or a button */
    menuBounce() {
      if (!ready('menu', 0.08)) return;
      bell(noteHz(3 + Math.floor(Math.random() * 5)), 0, 0.07, 0.45, 0.6);
    },

    /** Menu beam passes through the goal ring */
    chime() {
      if (!ready('chime', 0.3)) return;
      bell(noteHz(10), 0, 0.1, 0.6);
      bell(noteHz(12), 0.1, 0.08, 0.8);
    },
  };
})();

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
  SOURCE.x = INT.x;
  HOLE.x   = INT.x + INT.w;
  buildPaper();
  buildDoodles();
  layoutMenu();
  applyLevel();
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

// ── OBSTACLES & LEVEL EXTRAS ─────────────────────────────────────────────────
// Everything on the play screen besides the player's tiles:
//   wall   — stone: absorbs the beam (a miss); tiles can't be drawn through it
//   mover  — a blue stone bar that slides up and down: time your shot
//   blink  — a red block that is solid for a while, then switches off
//   portal — the beam enters one end and leaves the other, same direction
//   star   — the beam must touch every star before the goal opens
// Positions are fractions of the play area so they fit any window size.
const obstacles = [];       // { kind, x, y, w, h, ... }
const portals   = [];       // { a: {x, y}, b: {x, y}, r }
const stars     = [];       // { x, y, got, flash }

function starsLeft() { return stars.filter(s => !s.got).length; }

function buildObstacles() {
  obstacles.length = 0;
  const S = levelSpec;
  for (const w of S.walls) {
    obstacles.push({ kind: 'wall', x: INT.x + INT.w * w.x, y: INT.y + INT.h * w.y, w: INT.w * w.w, h: INT.h * w.h });
  }
  for (const b of S.bars) {
    const h = INT.h * b.h, cy = INT.y + INT.h * b.y;
    obstacles.push({
      kind: b.kind, x: INT.x + INT.w * b.x, y: cy - h / 2, w: INT.w * b.w, h,
      cy, amp: INT.h * b.amp, period: b.period, off: b.off, onLen: b.period * 0.4, solid: true,
    });
  }
  updateObstacles();
}

function buildExtras() {
  portals.length = 0;
  stars.length   = 0;
  for (const p of levelSpec.portals) {
    portals.push({
      a: { x: INT.x + INT.w * p.a.x, y: INT.y + INT.h * p.a.y },
      b: { x: INT.x + INT.w * p.b.x, y: INT.y + INT.h * p.b.y },
      r: 22,
    });
  }
  for (const s of levelSpec.stars) {
    stars.push({ x: INT.x + INT.w * s.x, y: INT.y + INT.h * s.y, got: false, flash: 0 });
  }
}

/** Moves the sliding bars and switches the blinking blocks (called once per frame) */
function updateObstacles() {
  for (const o of obstacles) {
    if (o.kind === 'mover') {
      o.y = o.cy + o.amp * Math.sin((frame + o.off) * 2 * Math.PI / o.period) - o.h / 2;
    } else if (o.kind === 'blink') {
      o.solid = (frame + o.off) % o.period < o.onLen;
    }
  }
}

function inObstacle(px, py, pad = 0) {
  return obstacles.some(o => o.solid !== false && px > o.x - pad && px < o.x + o.w + pad && py > o.y - pad && py < o.y + o.h + pad);
}

/** Does the line from (x1,y1) to (x2,y2) pass through any obstacle? */
function segmentHitsObstacle(x1, y1, x2, y2) {
  const steps = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 4));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    if (inObstacle(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, 3)) return true;
  }
  return false;
}

// ── LEVEL GENERATOR ──────────────────────────────────────────────────────────
// Every level is random but always winnable: a hidden solution path is planned
// first (beam → tile → tile → goal, with an optional portal jump), then the
// extras are scattered around it without ever blocking it. All numbers are
// fractions (0–1) of the play area interior.
const rnd  = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

function rectOf(x1, y1, x2, y2) {
  return { x1: Math.min(x1, x2), y1: Math.min(y1, y2), x2: Math.max(x1, x2), y2: Math.max(y1, y2) };
}

/** Do the rectangles overlap, once a (mx, my) clearance is added around b? */
function rectsClash(a, b, mx, my) {
  return a.x1 < b.x2 + mx && a.x2 > b.x1 - mx && a.y1 < b.y2 + my && a.y2 > b.y1 - my;
}

function speedName(v) {
  return v < 1.7 ? 'SLOW' : v < 2.5 ? 'MEDIUM' : v < 3.3 ? 'FAST' : v < 4.0 ? 'VERY FAST' : 'INSANE';
}

/** What each level adds: 1 walls only · 2 stars · 3 portals · 4 blinking blocks · 5 sliding bars · 7 a second blinking block */
function generateLevel(n) {
  const mx = 40 / INT.w, my = 40 / INT.h;      // ~40px clearance around the path
  const tw = 34 / INT.w, th = 34 / INT.h;      // stone thickness as a fraction
  const hb = 0.22;                             // height of sliding / blinking bars
  const v  = 1.4 + 0.4 * (n - 1);              // starts slow, speeds up every level
  const spec = { v, speed: speedName(v), src: 0, hole: 0, walls: [], bars: [], stars: [], portals: [] };

  // 1. The hidden solution: straight shot, turn at x = a, turn again into the goal.
  //    With a portal the first leg ends in portal A and the beam resumes from portal B.
  const ys = rnd(0.15, 0.85);
  let yh;  do { yh = rnd(0.12, 0.88); } while (Math.abs(yh - ys) < 0.3);
  const a  = rnd(0.45, 0.75);
  const usePortal = n >= 3;
  let ys2 = ys, pa = 0, pb = 0;
  if (usePortal) {
    pa = rnd(0.14, a - 0.2);
    pb = rnd(0.14, a - 0.2);
    let found = false;
    for (let i = 0; i < 200 && !found; i++) {
      ys2 = rnd(0.12, 0.88);
      found = Math.abs(ys2 - ys) >= 0.2 && Math.abs(ys2 - yh) >= 0.25;
    }
    if (!found) return generateLevel(n);                  // this start/goal pair leaves no room for a portal exit — draw again
    spec.portals.push({ a: { x: pa, y: ys }, b: { x: pb, y: ys2 } });
  }
  spec.src  = ys;
  spec.hole = yh;
  spec.turn = { x: a, y1: ys2, y2: yh };      // where the planned solution turns (tiles go here)

  const pieces = [{ r: rectOf(0, ys, usePortal ? pa : a, ys), horiz: true }];
  if (usePortal) pieces.push({ r: rectOf(pb, ys2, a, ys2), horiz: true });
  pieces.push({ r: rectOf(a, ys2, a, yh), horiz: false });
  pieces.push({ r: rectOf(a, yh, 1, yh),  horiz: true });

  const reserved = pieces.map(p => p.r);                 // path first, then everything placed later
  const extras0  = reserved.length;
  for (const p of spec.portals) {
    for (const e of [p.a, p.b]) reserved.push(rectOf(e.x - 30 / INT.w, e.y - 30 / INT.h, e.x + 30 / INT.w, e.y + 30 / INT.h));
  }

  // 2. Blinking blocks and sliding bars sit ON the path — the player has to time the beam.
  const kinds = [];
  if (n >= 4) for (let i = 0; i < (n >= 7 ? 2 : 1); i++) kinds.push('blink');
  if (n >= 5) kinds.push('mover');
  for (const kind of kinds) {
    for (let tries = 0; tries < 40; tries++) {
      const pc = pick(pieces.filter(p => p.horiz));
      const lo = Math.max(pc.r.x1 + 0.10, 0.12), hi = Math.min(pc.r.x2 - 0.10, 0.92 - tw);
      if (hi <= lo) continue;
      const x = rnd(lo, hi), y = pc.r.y1;
      let amp = 0, swath = rectOf(x, y - hb / 2, x + tw, y + hb / 2);
      if (kind === 'mover') {
        amp = Math.min(0.30, y - 0.02 - hb / 2, 0.98 - hb / 2 - y);
        if (amp < 0.19) continue;                         // not enough room to swing clear of the path
        swath = rectOf(x, y - amp - hb / 2, x + tw, y + amp + hb / 2);
      }
      // It may cross the leg it sits on, but must not touch any other part of the path or another extra.
      if (!pieces.every(p => p === pc || !rectsClash(swath, p.r, mx * 0.5, my * 0.5))) continue;
      if (reserved.slice(extras0).some(q => rectsClash(swath, q, mx * 0.5, my * 0.5))) continue;
      spec.bars.push({ kind, x, y, w: tw, h: hb, amp, period: Math.round(rnd(160, 230)), off: Math.floor(rnd(0, 230)) });
      reserved.push(swath);
      break;
    }
  }

  // 3. Stars along the path after the first leg (the first leg is free, so a star there is no puzzle).
  const nStars = n >= 2 ? Math.min(3, 1 + Math.floor((n - 2) / 2)) : 0;
  const starPieces = pieces.slice(1);
  for (let i = 0; i < nStars; i++) {
    for (let tries = 0; tries < 40; tries++) {
      const pc = pick(starPieces), t = rnd(0.2, 0.8);
      const x = pc.r.x1 + (pc.r.x2 - pc.r.x1) * t, y = pc.r.y1 + (pc.r.y2 - pc.r.y1) * t;
      const sr = rectOf(x, y, x, y);
      if (reserved.slice(extras0).some(q => rectsClash(sr, q, mx * 0.6, my * 0.6))) continue;
      spec.stars.push({ x, y });
      reserved.push(sr);
      break;
    }
  }

  // 4. Decoy stone walls anywhere that is clear.
  const nWalls = 2 + Math.floor(n / 2);
  for (let i = 0; i < nWalls; i++) {
    for (let tries = 0; tries < 60; tries++) {
      let w, h, x, y;
      if (Math.random() < 0.6) { w = tw; h = rnd(0.15, 0.35); x = rnd(0.14, 0.92 - w); y = rnd(0.03, 0.97 - h); }
      else                     { w = rnd(0.10, 0.25); h = th; x = rnd(0.14, 0.92 - w); y = rnd(0.05, 0.95 - h); }
      const r = rectOf(x, y, x + w, y + h);
      if (reserved.some(q => rectsClash(r, q, mx, my))) continue;
      spec.walls.push({ x, y, w, h });
      reserved.push(r);
      break;
    }
  }
  return spec;
}

// ── DRAWING THE EXTRAS ───────────────────────────────────────────────────────
function dashedBox(o, col, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = col;
  ctx.lineWidth   = 2;
  ctx.setLineDash([6, 5]);
  ctx.strokeRect(o.x, o.y, o.w, o.h);
  ctx.restore();
}

function drawObstacles() {
  for (const o of obstacles) {
    if (o.kind === 'wall') {
      ctx.save();
      ctx.fillStyle = 'rgba(110, 120, 140, 0.22)';
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.restore();
      hatchStrip(o.x, o.y, o.w, o.h);
      sketchRect(o.x, o.y, o.w, o.h, 2.2, 'rgba(30, 30, 30, 0.7)');
    } else if (o.kind === 'mover') {
      // dotted track so the player can see where it slides
      ctx.save();
      ctx.strokeStyle = 'rgba(55, 95, 155, 0.30)';
      ctx.lineWidth   = 1.5;
      ctx.setLineDash([3, 6]);
      ctx.beginPath();
      ctx.moveTo(o.x + o.w / 2, o.cy - o.amp - o.h / 2);
      ctx.lineTo(o.x + o.w / 2, o.cy + o.amp + o.h / 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(70, 110, 170, 0.25)';
      ctx.setLineDash([]);
      ctx.fillRect(o.x, o.y, o.w, o.h);
      ctx.restore();
      hatchStrip(o.x, o.y, o.w, o.h);
      sketchRect(o.x, o.y, o.w, o.h, 2.2, 'rgba(55, 95, 155, 0.9)');
      // up / down arrows
      const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
      ctx.save();
      ctx.strokeStyle = 'rgba(55, 95, 155, 0.9)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy - 6); ctx.lineTo(cx, cy - 12); ctx.lineTo(cx + 5, cy - 6);
      ctx.moveTo(cx - 5, cy + 6); ctx.lineTo(cx, cy + 12); ctx.lineTo(cx + 5, cy + 6);
      ctx.stroke();
      ctx.restore();
    } else {                                   // blink
      if (o.solid) {
        ctx.save();
        ctx.fillStyle = 'rgba(192, 57, 43, 0.20)';
        ctx.fillRect(o.x, o.y, o.w, o.h);
        ctx.restore();
        hatchStrip(o.x, o.y, o.w, o.h);
        sketchRect(o.x, o.y, o.w, o.h, 2.2, 'rgba(192, 57, 43, 0.9)');
      } else {
        const left = o.period - (frame + o.off) % o.period;            // frames until it turns solid again
        const warn = left < 40 ? (Math.floor(left / 5) % 2 ? 0.9 : 0.25) : 0.35;
        dashedBox(o, C.accent, warn);
      }
    }
  }
}

function drawPortals() {
  for (const p of portals) {
    for (const e of [p.a, p.b]) {
      ctx.save();
      const gr = ctx.createRadialGradient(e.x, e.y, 2, e.x, e.y, p.r + 6);
      gr.addColorStop(0, 'rgba(70, 110, 190, 0.35)');
      gr.addColorStop(1, 'rgba(70, 110, 190, 0)');
      ctx.fillStyle = gr;
      ctx.beginPath(); ctx.arc(e.x, e.y, p.r + 6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(55, 95, 155, 0.9)';
      ctx.lineWidth   = 2;
      ctx.setLineDash([6, 5]);
      ctx.lineDashOffset = -frame * 0.7;
      ctx.beginPath(); ctx.arc(e.x, e.y, p.r, 0, Math.PI * 2); ctx.stroke();
      ctx.lineDashOffset = frame * 0.9;
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(e.x, e.y, p.r * 0.55, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(55, 95, 155, 0.85)';
      ctx.font = `13px 'Patrick Hand', cursive`;
      ctx.textAlign = 'center';
      ctx.fillText('portal', e.x, e.y + p.r + 17);
      ctx.restore();
    }
  }
}

function starPath(x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45, ang = -Math.PI / 2 + i * Math.PI / 5;
    ctx.lineTo(x + Math.cos(ang) * rad, y + Math.sin(ang) * rad);
  }
  ctx.closePath();
}

function drawStars() {
  for (const s of stars) {
    if (s.flash > 0) s.flash = Math.max(0, s.flash - 0.04);
    ctx.save();
    if (s.got) {
      ctx.globalAlpha = 0.28;
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 1.2;
      starPath(s.x, s.y, 11);
      ctx.stroke();
      if (s.flash > 0) {                       // little burst when collected
        ctx.globalAlpha = s.flash;
        ctx.strokeStyle = 'rgba(235, 185, 60, 1)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(s.x, s.y, 12 + (1 - s.flash) * 26, 0, Math.PI * 2); ctx.stroke();
      }
    } else {
      const r = 13 + Math.sin(frame * 0.1 + s.x) * 1.5;
      ctx.fillStyle   = 'rgba(235, 185, 60, 0.95)';
      ctx.strokeStyle = C.ink;
      ctx.lineWidth   = 1.8;
      ctx.lineJoin    = 'round';
      starPath(s.x, s.y, r);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }
}

/** Dashed ring around the goal while stars are still missing */
function drawGoalLock() {
  const left = starsLeft();
  if (left === 0) return;
  ctx.save();
  ctx.strokeStyle = 'rgba(30, 30, 30, 0.55)';
  ctx.lineWidth   = 2;
  ctx.setLineDash([4, 5]);
  ctx.beginPath(); ctx.arc(HOLE.x, HOLE.y, HOLE.r + 12, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = C.inkMid;
  ctx.font = `15px 'Patrick Hand', cursive`;
  ctx.textAlign = 'right';
  ctx.fillText(`★ ${left} to go`, HOLE.x - HOLE.r - 20, HOLE.y + 5);
  ctx.restore();
}

/** Short message at the top of the play area (e.g. "Collect all the stars first!") */
function drawPlayMessage() {
  if (play.msgT <= 0) return;
  play.msgT--;
  ctx.save();
  ctx.globalAlpha = Math.min(1, play.msgT / 30);
  ctx.fillStyle = C.accent;
  ctx.font = `bold 28px 'Caveat', cursive`;
  ctx.textAlign = 'center';
  ctx.fillText(play.msg, INT.x + INT.w / 2, INT.y + 34);
  ctx.restore();
}

// ── PLAY SCREEN BEAM ─────────────────────────────────────────────────────────
// Fired from the source. Bounces off the player's tiles, and when it reaches a
// wall it sparks, rests for a moment, then fires again.
const shot = { x: 0, y: 0, dx: 0, dy: 0, trail: [], maxTrail: 90, wait: 0, spark: 0, sx: 0, sy: 0, pcd: 0, bn: 0 };   // bn = bounces so far this shot (picks the bounce note)

function resetShot() {
  shot.x = SOURCE.x + 10;  shot.y = SOURCE.y;
  shot.dx = LEVEL.v;       shot.dy = 0;
  shot.trail = [];  shot.wait = 0;  shot.pcd = 0;  shot.bn = 0;
  sfx.fire();
}

/** The beam ends here: spark, short rest, then it fires again */
function beamMiss() {
  shot.sx = shot.x;  shot.sy = shot.y;
  shot.spark = 1;
  // random rest, so sliding / blinking blocks can't lock-step with the beam (longer random range when the level has any)
  shot.wait  = levelSpec.bars.length ? 60 + Math.floor(Math.random() * 200) : 90 + Math.floor(Math.random() * 50);
  play.misses++;
  sfx.miss();
  shake = 9;
  burst(shot.x, shot.y, 22, C.accent, 3.5);
}

/** If the beam is inside a portal, move it to the other end (same direction) */
function portalJump() {
  for (const p of portals) {
    for (const [from, to] of [[p.a, p.b], [p.b, p.a]]) {
      if (Math.hypot(shot.x - from.x, shot.y - from.y) < p.r) {
        shot.x = to.x;  shot.y = to.y;
        shot.trail = [];                                  // no line across the screen
        sfx.portal();
        burst(from.x, from.y, 12, '#3E6FB0', 2.5);
        burst(to.x, to.y, 12, '#3E6FB0', 2.5);
        shot.pcd = Math.ceil(2 * p.r / LEVEL.v) + 4;      // ignore portals until it has left this one
        return;
      }
    }
  }
}

function updateShot() {
  if (play.won) return;                      // level is solved — beam stays in the hole
  shot.spark = Math.max(0, shot.spark - 0.03);
  if (shot.wait > 0) {                       // beam is resting after a miss
    shot.trail.shift();                      // trail fades out
    if (--shot.wait === 0) resetShot();
    return;
  }
  shot.trail.push({ x: shot.x, y: shot.y });
  if (shot.trail.length > shot.maxTrail) shot.trail.shift();

  const px = shot.x, py = shot.y;
  let nx = px + shot.dx, ny = py + shot.dy;

  // Player's tiles
  for (const t of tiles) {
    if (t.cd > 0) { t.cd--; continue; }
    if (segmentIntersect(px, py, nx, ny, t.x1, t.y1, t.x2, t.y2)) {
      reflectOff(t, shot);
      sfx.bounce(shot.bn++);
      burst(px, py, 6, C.ink, 2, 2);
      t.cd = 8;                              // stops double-bounce on the same tile
      nx = px + shot.dx;  ny = py + shot.dy;
    }
  }

  shot.x = nx;  shot.y = ny;

  // Portals
  if (shot.pcd > 0) shot.pcd--; else portalJump();

  // Stars
  for (const st of stars) {
    if (!st.got && Math.hypot(shot.x - st.x, shot.y - st.y) < 18) { st.got = true; st.flash = 1; burst(st.x, st.y, 18, '#E0A800', 3.5, 3.5); sfx.star(stars.filter(s => s.got).length - 1); }
  }

  // Goal hole (only opens once every star is collected)
  if (Math.hypot(shot.x - HOLE.x, shot.y - HOLE.y) < HOLE.r) {
    if (starsLeft() > 0) {
      play.msg = 'Collect all the stars first!';
      play.msgT = 150;
      sfx.denied();
      beamMiss();
      return;
    }
    shot.x = HOLE.x;  shot.y = HOLE.y;
    shot.sx = shot.x;  shot.sy = shot.y;
    shot.spark = 1;
    play.won = true;
    play.total += play.misses;
    recordWin();
    for (const c of [C.accent, '#E0A800', '#3E6FB0']) burst(HOLE.x, HOLE.y, 30, c, 6, 4);
    sfx.win(LEVEL.num === TOTAL_LEVELS);
    return;
  }

  // Stone, sliding bars and solid blinking blocks absorb the beam
  if (inObstacle(shot.x, shot.y)) { beamMiss(); return; }

  // Walls
  const x1 = INT.x, x2 = INT.x + INT.w, y1 = INT.y, y2 = INT.y + INT.h;
  if (shot.x <= x1 || shot.x >= x2 || shot.y <= y1 || shot.y >= y2) {
    shot.x = Math.max(x1, Math.min(x2, shot.x));
    shot.y = Math.max(y1, Math.min(y2, shot.y));
    beamMiss();
  }
}

/** Beam + the spark where it strikes a wall */
function drawShot() {
  drawBeamOf(shot, shot.wait === 0);
  if (play.won) shot.spark = 0.6 + 0.4 * Math.sin(frame * 0.15);   // keeps glowing in the hole
  if (shot.spark > 0) {
    const r = 12 + shot.spark * 8;
    const sg = ctx.createRadialGradient(shot.sx, shot.sy, 0, shot.sx, shot.sy, r);
    sg.addColorStop(0,   `rgba(255, 180, 100, ${0.7 * shot.spark})`);
    sg.addColorStop(0.5, `rgba(220,  80,  40, ${0.4 * shot.spark})`);
    sg.addColorStop(1,    'rgba(192,  57,  43, 0)');
    ctx.fillStyle = sg;
    ctx.beginPath(); ctx.arc(shot.sx, shot.sy, r, 0, Math.PI * 2); ctx.fill();
  }
}

// ── POLISH: PARTICLES, SCREEN SHAKE, FADE, PAUSE ─────────────────────────────
const particles = [];       // { x, y, vx, vy, life, max, col, size }
let   shake  = 0;           // screen-shake strength, decays every frame
let   fade   = 0;           // 1 → 0 paper-coloured overlay after a screen change
let   paused = false;

/** Burst of n sparks from a point */
function burst(x, y, n, col, speed = 3, size = 3) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, s = speed * (0.3 + Math.random() * 0.7);
    const life = 25 + Math.random() * 25;
    particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life, max: life, col, size: size * (0.6 + Math.random() * 0.8) });
  }
}

/** Change screen with a soft fade-in */
function goTo(s) { if (s === 'LEVELS') LS.t0 = frame; state = s; fade = 1; paused = false; particles.length = 0; shake = 0; }

function updateFX() {
  shake = Math.max(0, shake - 0.6);
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;  p.y += p.vy;  p.vx *= 0.96;  p.vy = p.vy * 0.96 + 0.05;
    if (--p.life <= 0) particles.splice(i, 1);
  }
}

function drawParticles() {
  ctx.save();
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.col;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (0.4 + 0.6 * p.life / p.max), 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawFade() {
  if (fade <= 0) return;
  ctx.save();
  ctx.globalAlpha = fade;
  ctx.fillStyle = '#F6F1E9';
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  fade = Math.max(0, fade - 0.04);
}

function drawPause() {
  ctx.save();
  ctx.fillStyle = 'rgba(246, 241, 233, 0.75)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.fillStyle = C.ink;
  ctx.font = `bold 72px 'Caveat', cursive`;
  ctx.fillText('PAUSED', W/2, H/2 - 10);
  ctx.fillStyle = C.inkMid;
  ctx.font = `22px 'Patrick Hand', cursive`;
  ctx.fillText('press P, Space or click to continue', W/2, H/2 + 30);
  ctx.restore();
}

// ── PLAYER TILES ─────────────────────────────────────────────────────────────
// Click + drag draws a short tile. Only LEVEL.tiles can exist at once —
// drawing one more makes the oldest fade away.
const tiles    = [];        // placed tiles: { x1, y1, x2, y2, cd }
const oldTiles = [];        // removed tiles still fading out: { ..., alpha }
let   drawing  = null;      // tile being drawn: { x1, y1, x2, y2 }

function clearTiles() {
  tiles.length = 0;  oldTiles.length = 0;  drawing = null;
}

// ── WIN STATE ────────────────────────────────────────────────────────────────
// The level is won when the beam reaches the goal hole. A beam that hits any
// other part of a wall is a miss and simply fires again.
const play = { won: false, misses: 0, total: 0, rating: 0, msg: '', msgT: 0 };   // total = misses over all finished levels

// ── PROGRESS (saved in the browser) ──────────────────────────────────────────
// best[n] = best star rating for level n (0 = not cleared yet). 3 stars = no
// misses, 2 stars = up to 2 misses, 1 star = cleared.
const SAVE_KEY = 'refract.progress';
const progress = { best: new Array(TOTAL_LEVELS + 1).fill(0) };

function loadProgress() {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (d && Array.isArray(d.best)) for (let i = 1; i <= TOTAL_LEVELS; i++) progress.best[i] = Math.max(0, Math.min(3, d.best[i] | 0));
  } catch (e) { /* no saved progress yet, or storage is blocked */ }
}

function saveProgress() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(progress)); } catch (e) { /* ignore */ }
}

function ratingFor(misses) { return misses === 0 ? 3 : misses <= 2 ? 2 : 1; }
function isUnlocked(n)     { return n === 1 || progress.best[n - 1] > 0; }
function totalStars()      { return progress.best.reduce((a, b) => a + b, 0); }

/** Remember the result of the level just won */
function recordWin() {
  const r = ratingFor(play.misses);
  play.rating = r;
  if (r > progress.best[LEVEL.num]) { progress.best[LEVEL.num] = r; saveProgress(); }
}
loadProgress();

/** Fresh attempt: no tiles, beam back at the source, counters cleared */
function resetPlay() {
  clearTiles();
  resetShot();
  play.won    = false;
  play.misses = 0;
  play.msgT   = 0;
}

/** Set up the current level from its (random) layout: speed, source/goal height, obstacles, extras */
function applyLevel() {
  if (!levelSpec) levelSpec = generateLevel(LEVEL.num);
  LEVEL.speed = levelSpec.speed;
  LEVEL.v     = levelSpec.v;
  SOURCE.y = INT.y + INT.h * levelSpec.src;
  HOLE.y   = INT.y + INT.h * levelSpec.hole;
  buildObstacles();
  buildExtras();
  resetPlay();
}

function startGame(n = 1) {
  LEVEL.num  = n;
  play.total = 0;
  levelSpec  = generateLevel(n);
  applyLevel();
  fade = 1;  particles.length = 0;
}

function nextLevel() {
  LEVEL.num++;
  levelSpec = generateLevel(LEVEL.num);
  applyLevel();
  fade = 1;  particles.length = 0;  paused = false;
}

/** End point for the tile being drawn: kept inside the play area and within the length limit */
function limitTileEnd(x1, y1, px, py) {
  px = Math.max(INT.x + 4, Math.min(INT.x + INT.w - 4, px));
  py = Math.max(INT.y + 4, Math.min(INT.y + INT.h - 4, py));
  const len = Math.hypot(px - x1, py - y1);
  if (len > LEVEL.maxLen) {
    px = x1 + (px - x1) * LEVEL.maxLen / len;
    py = y1 + (py - y1) * LEVEL.maxLen / len;
  }
  return { x: px, y: py };
}

function startTile(px, py) {
  if (px < INT.x || px > INT.x + INT.w || py < INT.y || py > INT.y + INT.h) return;
  if (inObstacle(px, py, 3)) return;
  drawing = { x1: px, y1: py, x2: px, y2: py };
}

function finishTile() {
  if (!drawing) return;
  const blocked = segmentHitsObstacle(drawing.x1, drawing.y1, drawing.x2, drawing.y2);
  if (!blocked && Math.hypot(drawing.x2 - drawing.x1, drawing.y2 - drawing.y1) >= 12) {   // ignore tiny clicks and tiles through stone
    tiles.push({ ...drawing, cd: 0 });
    sfx.tile(Math.hypot(drawing.x2 - drawing.x1, drawing.y2 - drawing.y1));
    if (tiles.length > LEVEL.tiles) oldTiles.push({ ...tiles.shift(), alpha: 1 });
  }
  drawing = null;
}

function drawTileLine(t, alpha, dashed, col = C.ink) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = col;
  ctx.lineWidth   = 2.5;
  ctx.lineCap     = 'round';
  ctx.shadowColor = 'rgba(0,0,0,0.12)';
  ctx.shadowBlur  = 4;
  if (dashed) ctx.setLineDash([7, 6]);
  ctx.beginPath();
  ctx.moveTo(t.x1, t.y1);
  ctx.lineTo(t.x2, t.y2);
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = alpha * 0.4;
  ctx.fillStyle = C.ink;
  ctx.beginPath(); ctx.arc(t.x1, t.y1, 3, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(t.x2, t.y2, 3, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

function drawTiles() {
  for (let i = oldTiles.length - 1; i >= 0; i--) {
    oldTiles[i].alpha -= 0.04;
    if (oldTiles[i].alpha <= 0) { oldTiles.splice(i, 1); continue; }
    drawTileLine(oldTiles[i], oldTiles[i].alpha, false);
  }
  // The tile that will vanish next is drawn a little lighter once the set is full
  tiles.forEach((t, i) => drawTileLine(t, (tiles.length === LEVEL.tiles && i === 0) ? 0.6 : 1, false));
  if (drawing) {
    const blocked = segmentHitsObstacle(drawing.x1, drawing.y1, drawing.x2, drawing.y2);
    drawTileLine(drawing, 0.7, true, blocked ? C.accent : C.ink);
  }
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
  resetShot();
}

function reflectOff(m, b = beam) {
  const nx = -(m.y2 - m.y1), ny = (m.x2 - m.x1);
  const len = Math.hypot(nx, ny);
  const unx = nx / len, uny = ny / len;
  const dot = b.dx * unx + b.dy * uny;
  b.dx -= 2 * dot * unx;
  b.dy -= 2 * dot * uny;
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
      sfx.menuBounce();
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
      sfx.menuBounce();
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
    if (!goal.inside) { goal.hits++; goal.flash = 1; goal.inside = true; sfx.chime(); }
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

/** The beam itself — trail + glowing head (same design on every screen) */
function drawBeam() { drawBeamOf(beam, true); }

function drawBeamOf(b, showHead) {
  // Laser trail
  ctx.save();
  for (let i = 1; i < b.trail.length; i++) {
    const t = i / b.trail.length;
    ctx.strokeStyle = `rgba(192, 57, 43, ${t * 0.55})`;
    ctx.lineWidth   = 1 + t * 1.8;
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.moveTo(b.trail[i-1].x, b.trail[i-1].y);
    ctx.lineTo(b.trail[i].x, b.trail[i].y);
    ctx.stroke();
  }
  ctx.restore();
  if (!showHead) return;

  // Laser head glow
  const gr = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 16);
  gr.addColorStop(0, 'rgba(192, 57, 43, 0.75)');
  gr.addColorStop(1, 'rgba(192, 57, 43, 0)');
  ctx.fillStyle = gr;
  ctx.beginPath(); ctx.arc(b.x, b.y, 16, 0, Math.PI*2); ctx.fill();
  // Hot core
  ctx.fillStyle = '#FF6B6B';
  ctx.beginPath(); ctx.arc(b.x, b.y, 3.5, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath(); ctx.arc(b.x, b.y, 1.5, 0, Math.PI*2); ctx.fill();
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
const HOWTO_PANEL_H = 520;
const HOWTO_BACK = () => ({ x: W/2 - 90, y: Math.max(40, H/2 - HOWTO_PANEL_H/2 - 20) + HOWTO_PANEL_H + 20, w: 180, h: 46 });

function drawHowTo() {
  const pw = Math.min(760, W - 80), ph = HOWTO_PANEL_H;
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
    ['Click and drag to draw a short tile — the beam bounces off it.',   false],
    ['Only 3 tiles at a time: draw a 4th and the oldest disappears.',    false],
    ['Stone walls, sliding bars and blinking blocks absorb the beam.',   false],
    ['Portals: the beam goes in one and comes out the other.',           false],
    ['Collect every star (★) to unlock the goal.',                        false],
    ['Guide the beam into the GOAL hole on the right wall.',             true ],
  ];
  ctx.save();
  lines.forEach(([text, strong], i) => {
    const y = py + 135 + i * 44;
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

// ── PLAY SCREEN ──────────────────────────────────────────────────────────────
const PLAY_MENU_BTN = () => ({ x: PLAY.x, y: 8, w: 120, h: 32 });

function drawPlaying() {
  ctx.save();
  if (shake > 0) ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
  drawPlayArea();
  drawSource();
  drawHole();
  drawGoalLock();
  drawPortals();
  drawStars();
  drawObstacles();
  if (!play.won && !paused) updateObstacles();
  if (!paused) { updateShot(); updateFX(); }
  drawTiles();
  drawShot();
  drawParticles();
  ctx.restore();
  drawHUD();
  drawPlayMessage();
  const b = PLAY_MENU_BTN();
  drawBtn(b.x, b.y, b.w, b.h, '←  LEVELS', C.inkMid);
  if (play.won) drawWin();
  else if (paused) drawPause();
}

// ── WIN SCREEN ───────────────────────────────────────────────────────────────
const WIN_BTNS = () => ({
  again: { x: W/2 - 190, y: H/2 + 60, w: 180, h: 50 },
  menu:  { x: W/2 + 10,  y: H/2 + 60, w: 180, h: 50 },
});

function drawWin() {
  ctx.save();
  ctx.fillStyle = 'rgba(246, 241, 233, 0.65)';
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  const pw = 460, ph = 270, px = W/2 - pw/2, py = H/2 - 130;
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillRect(px, py, pw, ph);
  ctx.restore();
  sketchRect(px, py, pw, ph, 2.5, C.ink);

  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = C.accent;
  ctx.font = `bold 72px 'Caveat', cursive`;
  ctx.fillText(LEVEL.num === TOTAL_LEVELS ? 'ALL CLEAR!' : 'GOAL!', W/2, py + 82);
  ctx.restore();
  wavyLine(W/2 - 110, W/2 + 110, py + 96, 3, C.accent);

  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = C.inkMid;
  ctx.font = `22px 'Patrick Hand', cursive`;
  const m = play.misses;
  if (LEVEL.num === TOTAL_LEVELS) {
    ctx.fillText(`All ${TOTAL_LEVELS} levels cleared · ${play.total} miss${play.total === 1 ? '' : 'es'} in total`, W/2, py + 135);
  } else {
    ctx.fillText(m === 0 ? `Level ${LEVEL.num} — perfect, first shot!` : `Level ${LEVEL.num} — solved after ${m} miss${m === 1 ? '' : 'es'}`, W/2, py + 135);
  }
  ctx.restore();

  // Star rating for this level
  for (let i = 0; i < 3; i++) {
    ctx.save();
    ctx.lineJoin = 'round';  ctx.lineWidth = 1.8;  ctx.strokeStyle = C.ink;
    ctx.fillStyle = i < play.rating ? 'rgba(235, 185, 60, 0.95)' : 'rgba(0,0,0,0.05)';
    ctx.globalAlpha = i < play.rating ? 1 : 0.5;
    starPath(W/2 + (i - 1) * 40, py + 165, 15);
    ctx.fill();  ctx.stroke();
    ctx.restore();
  }

  const B = WIN_BTNS();
  drawBtn(B.again.x, B.again.y, B.again.w, B.again.h, LEVEL.num === TOTAL_LEVELS ? '↻   PLAY AGAIN' : 'NEXT LEVEL   →', C.accent);
  drawBtn(B.menu.x,  B.menu.y,  B.menu.w,  B.menu.h,  '≡   LEVELS',     C.inkMid);
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

/** HUD strip below the play area */
function drawHUD() {
  // Faint how-to hint inside the play area
  ctx.save();
  ctx.fillStyle = C.inkLight;
  ctx.font      = `14px 'Patrick Hand', cursive`;
  ctx.textAlign = 'center';
  ctx.fillText(`click + drag to draw a tile  ·  only ${LEVEL.tiles} at a time — the oldest disappears`, INT.x + INT.w / 2, INT.y + INT.h - 14);
  ctx.restore();

  const hx = PLAY.x, hy = PLAY.y + PLAY.h + 8;
  const hw = PLAY.w;

  ctx.save();
  ctx.fillStyle    = C.inkMid;
  ctx.font         = `13px 'Patrick Hand', cursive`;
  ctx.textBaseline = 'top';

  // Left: level
  ctx.textAlign = 'left';
  ctx.fillText(`LEVEL  ${LEVEL.num}/${TOTAL_LEVELS}   ·   MISSES: ${play.misses}` +
    (stars.length ? `   ·   STARS: ${stars.length - starsLeft()}/${stars.length}` : ''), hx, hy);

  // Centre: speed
  ctx.textAlign = 'center';
  ctx.fillStyle = C.inkLight;
  ctx.fillText(`SPEED: ${LEVEL.speed}`, hx + hw / 2, hy);

  // Right: tiles in use + length limit + ESC tip
  ctx.textAlign = 'right';
  ctx.fillStyle = C.inkMid;
  ctx.fillText(`TILES: ${tiles.length}/${LEVEL.tiles}   ·   MAX LENGTH: ${LEVEL.maxLen}   ·   P = pause   ·   ESC = levels   ·   M = ${sfx.isMuted() ? 'sound off' : 'sound on'}`, hx + hw, hy);
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

// ── LEVEL SELECT SCREEN ──────────────────────────────────────────────────────
// 8 cards on a drafting sheet. A level opens once the one before it is cleared;
// each card shows the best star rating. A laser loops around the cards.
const LEVEL_INFO = [
  null,
  { name: 'FIRST REFLECTION' },
  { name: 'STELLAR PATH' },
  { name: 'PORTAL DRIFT' },
  { name: 'BLINK CHRONO' },
  { name: 'SLIDING PISTON' },
  { name: 'RUSH HOUR' },
  { name: 'DOUBLE BLINK' },
  { name: 'MASTER BLUEPRINT' },
];
const LS = { hover: 0, note: '', noteT: 0, d: 0, t0: 0 };    // hovered card, "locked" note, beam distance

function levelRects() {
  const gap  = 28;
  const gw   = Math.min(W - 100, 1100);
  const cw   = (gw - gap * 3) / 4;
  const area = { top: 168, bottom: H - 108 };
  const ch   = Math.max(170, Math.min(cw * 1.08, (area.bottom - area.top - gap) / 2));
  const top  = area.top + Math.max(0, (area.bottom - area.top - (2 * ch + gap)) / 2);
  const gx   = (W - gw) / 2;
  const cards = [];
  for (let i = 0; i < TOTAL_LEVELS; i++) {
    cards.push({ n: i + 1, x: gx + (i % 4) * (cw + gap), y: top + Math.floor(i / 4) * (ch + gap), w: cw, h: ch });
  }
  const by = H - 70;
  return {
    cards, gx, gw, gap, top, ch,
    back:  { x: gx,            y: by, w: 200, h: 46 },
    sound: { x: gx + gw - 170, y: by, w: 170, h: 46 },
    stars: { x: gx + 220,      y: by, w: gw - 220 - 190, h: 46 },
  };
}

/** Little hand-drawn picture of what each level is about */
function drawLevelIcon(n, cx, cy, s) {
  ctx.save();
  ctx.lineCap = 'round';  ctx.lineJoin = 'round';
  ctx.strokeStyle = C.ink;  ctx.lineWidth = 2;
  const t = frame * 0.04;
  if (n === 1) {                                   // mirror + beam
    // mirror: thick glass line with a shine, on a little stand
    ctx.lineWidth = 4.5;
    ctx.beginPath(); ctx.moveTo(cx - s * 0.18, cy + s * 0.55); ctx.lineTo(cx + s * 0.22, cy - s * 0.55); ctx.stroke();
    ctx.strokeStyle = 'rgba(120, 170, 220, 0.9)';  ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx - s * 0.14, cy + s * 0.45); ctx.lineTo(cx + s * 0.18, cy - s * 0.45); ctx.stroke();
    ctx.strokeStyle = C.ink;  ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx - s * 0.18, cy + s * 0.55); ctx.lineTo(cx - s * 0.4, cy + s * 0.7); ctx.moveTo(cx - s * 0.18, cy + s * 0.55); ctx.lineTo(cx + s * 0.05, cy + s * 0.7); ctx.stroke();
    // beam in, beam out (the outgoing part pulses), spark on the mirror
    const hx = cx + s * 0.02, hy = cy + s * 0.02;
    ctx.strokeStyle = C.accent;  ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(cx - s * 1.1, hy); ctx.lineTo(hx, hy); ctx.lineTo(hx + s * 0.1 + Math.sin(frame * 0.12) * 2, cy - s * 1.0); ctx.stroke();
    const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, s * 0.3);
    g.addColorStop(0, 'rgba(255, 200, 130, 0.9)');  g.addColorStop(1, 'rgba(192, 57, 43, 0)');
    ctx.fillStyle = g;  ctx.beginPath(); ctx.arc(hx, hy, s * 0.3, 0, Math.PI * 2); ctx.fill();
  } else if (n === 2) {                            // stars
    ctx.fillStyle = 'rgba(235, 185, 60, 0.95)';  ctx.lineWidth = 1.8;
    starPath(cx, cy, s * 0.55);                     ctx.fill(); ctx.stroke();
    starPath(cx - s * 0.8, cy - s * 0.25, s * 0.3); ctx.fill(); ctx.stroke();
    starPath(cx + s * 0.8, cy + s * 0.2, s * 0.3);  ctx.fill(); ctx.stroke();
  } else if (n === 3) {                            // portals
    for (const [px, col] of [[cx - s * 0.65, '#2A9DB8'], [cx + s * 0.65, '#7A52C7']]) {
      ctx.strokeStyle = col;
      for (let k = 0; k < 3; k++) {
        ctx.lineWidth = 2.4 - k * 0.6;  ctx.globalAlpha = 1 - k * 0.25;
        ctx.beginPath(); ctx.ellipse(px, cy, s * (0.2 - k * 0.04) + Math.sin(t * 2 + k) * 1.2, s * (0.5 - k * 0.1), 0, 0, Math.PI * 2); ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  } else if (n === 4) {                            // clock
    ctx.beginPath(); ctx.arc(cx, cy, s * 0.6, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(t * 3) * s * 0.42, cy + Math.sin(t * 3) * s * 0.42); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(t * 0.5) * s * 0.28, cy + Math.sin(t * 0.5) * s * 0.28); ctx.stroke();
  } else if (n === 5) {                            // piston: bar slides along a track
    const o = Math.sin(t * 1.5) * s * 0.3;
    ctx.setLineDash([3, 4]);  ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(cx - s * 0.8, cy); ctx.lineTo(cx + s * 0.8, cy); ctx.stroke();  ctx.setLineDash([]);
    ctx.lineWidth = 2;  ctx.fillStyle = 'rgba(62, 111, 176, 0.35)';
    ctx.fillRect(cx - s * 0.2 + o, cy - s * 0.5, s * 0.4, s);  ctx.strokeRect(cx - s * 0.2 + o, cy - s * 0.5, s * 0.4, s);
  } else if (n === 6) {                            // bar + block
    const o = Math.sin(t * 2) * s * 0.3;
    ctx.fillStyle = 'rgba(62, 111, 176, 0.35)';
    ctx.fillRect(cx - s * 0.7, cy - s * 0.4 + o, s * 0.35, s * 0.8);  ctx.strokeRect(cx - s * 0.7, cy - s * 0.4 + o, s * 0.35, s * 0.8);
    ctx.setLineDash(Math.sin(t * 3) > 0 ? [] : [4, 3]);  ctx.strokeStyle = C.accent;  ctx.fillStyle = 'rgba(192, 57, 43, 0.25)';
    ctx.fillRect(cx + s * 0.25, cy - s * 0.4, s * 0.45, s * 0.8);  ctx.strokeRect(cx + s * 0.25, cy - s * 0.4, s * 0.45, s * 0.8);
  } else if (n === 7) {                            // two blinking blocks, taking turns
    for (let k = 0; k < 2; k++) {
      const on = Math.sin(t * 3 + k * Math.PI) > 0;
      ctx.setLineDash(on ? [] : [4, 3]);  ctx.strokeStyle = C.accent;  ctx.fillStyle = on ? 'rgba(192, 57, 43, 0.3)' : 'rgba(192, 57, 43, 0.05)';
      const bx = cx + (k ? s * 0.12 : -s * 0.68);
      ctx.fillRect(bx, cy - s * 0.4, s * 0.56, s * 0.8);  ctx.strokeRect(bx, cy - s * 0.4, s * 0.56, s * 0.8);
    }
  } else {                                         // master blueprint: a bit of everything
    ctx.strokeRect(cx - s * 0.9, cy - s * 0.6, s * 1.8, s * 1.2);
    ctx.lineWidth = 1;  ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.moveTo(cx - s * 0.9, cy); ctx.lineTo(cx + s * 0.9, cy); ctx.moveTo(cx, cy - s * 0.6); ctx.lineTo(cx, cy + s * 0.6); ctx.stroke();
    ctx.globalAlpha = 1;  ctx.lineWidth = 1.6;
    ctx.fillStyle = 'rgba(235, 185, 60, 0.95)';  starPath(cx - s * 0.45, cy - s * 0.3, s * 0.2);  ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#7A52C7';  ctx.beginPath(); ctx.ellipse(cx + s * 0.45, cy - s * 0.3, s * 0.1, s * 0.22, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = C.accent;   ctx.strokeRect(cx - s * 0.6, cy + s * 0.12, s * 0.3, s * 0.34);
    ctx.fillStyle = 'rgba(62, 111, 176, 0.4)';  ctx.fillRect(cx + s * 0.25, cy + s * 0.1, s * 0.4, s * 0.12);
  }
  ctx.restore();
}

function drawPadlock(x, y, s) {
  ctx.save();
  ctx.strokeStyle = C.inkMid;  ctx.fillStyle = 'rgba(255,255,255,0.9)';  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(x, y - s * 0.25, s * 0.3, Math.PI, 0); ctx.stroke();
  ctx.fillRect(x - s * 0.45, y - s * 0.2, s * 0.9, s * 0.7);  ctx.strokeRect(x - s * 0.45, y - s * 0.2, s * 0.9, s * 0.7);
  ctx.fillStyle = C.inkMid;
  ctx.beginPath(); ctx.arc(x, y + s * 0.08, s * 0.08, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(x - 1.5, y + s * 0.08, 3, s * 0.2);
  ctx.restore();
}

const LV_COL = [null, '#C0392B', '#E0A800', '#3E6FB0', '#7A52C7', '#2A9DB8', '#D2691E', '#B03A7A', '#2E7D4F'];

function drawLevelCard(c, hov) {
  const open = isUnlocked(c.n), best = progress.best[c.n], info = LEVEL_INFO[c.n], col = LV_COL[c.n];
  const cleared = best > 0;
  const current = open && !cleared && (c.n === 1 || progress.best[c.n - 1] > 0);   // the level to play next
  const lift = hov && open ? -6 : 0;

  // Slide-in when the screen opens (staggered)
  const e0 = Math.max(0, Math.min(1, (frame - LS.t0 - c.n * 4) / 24)), e = 1 - Math.pow(1 - e0, 3);
  if (e <= 0) return;
  const x = c.x, y = c.y + lift + (1 - e) * 46, w = c.w, h = c.h;
  const tilt = hov && open ? 0 : (((c.n * 37) % 7) - 3) * 0.004;

  ctx.save();
  ctx.globalAlpha = e;
  ctx.translate(x + w / 2, y + h / 2);  ctx.rotate(tilt);  ctx.translate(-(x + w / 2), -(y + h / 2));

  // Paper card (glows when it is the next level to play)
  ctx.save();
  ctx.shadowColor = current ? `rgba(192, 57, 43, ${0.35 + 0.2 * Math.sin(frame * 0.08)})` : 'rgba(0,0,0,0.18)';
  ctx.shadowBlur  = current ? 18 : (hov && open ? 16 : 6);
  ctx.shadowOffsetX = current ? 0 : 4;  ctx.shadowOffsetY = current ? 0 : 5;
  ctx.fillStyle = open ? '#FFFFFF' : '#E7E0D2';
  ctx.fillRect(x, y, w, h);
  ctx.restore();

  // Locked cards get a pencil hatch
  if (!open) {
    ctx.save();
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    ctx.strokeStyle = 'rgba(80, 70, 50, 0.10)';  ctx.lineWidth = 1;
    for (let k = -h; k < w; k += 11) { ctx.beginPath(); ctx.moveTo(x + k, y + h); ctx.lineTo(x + k + h, y); ctx.stroke(); }
    ctx.restore();
  } else {
    // soft colour wash behind the header
    ctx.fillStyle = col + '1F';
    ctx.fillRect(x, y, w, 66);
  }
  sketchRect(x, y, w, h, current || (hov && open) ? 3 : 2, open ? (current ? C.accent : hov ? col : C.ink) : C.inkLight);

  // Washi tape on top
  ctx.save();
  ctx.translate(x + w / 2, y + 2);  ctx.rotate(-0.05);
  ctx.fillStyle = open ? col + '66' : 'rgba(120,110,90,0.28)';
  ctx.fillRect(-30, -9, 60, 18);
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';  ctx.lineWidth = 1;  ctx.strokeRect(-30, -9, 60, 18);
  ctx.restore();

  // Header: level number + speed chip, then the name
  ctx.save();
  ctx.globalAlpha = e * (open ? 1 : 0.6);
  ctx.textAlign = 'left';  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = 'rgba(55, 95, 155, 0.9)';
  ctx.font = `13px 'Patrick Hand', cursive`;
  ctx.fillText(`LEVEL 0${c.n}`, x + 12, y + 30);
  const sp = speedName(1.4 + 0.4 * (c.n - 1));
  ctx.font = `bold 11px 'Architects Daughter', cursive`;
  const sw = ctx.measureText(sp).width + 12;
  ctx.strokeStyle = open ? col : C.inkLight;  ctx.lineWidth = 1.4;
  ctx.strokeRect(x + w - 12 - sw, y + 18, sw, 18);
  ctx.fillStyle = open ? col : C.inkLight;  ctx.textAlign = 'center';
  ctx.fillText(sp, x + w - 12 - sw / 2, y + 31);
  ctx.textAlign = 'left';  ctx.fillStyle = C.ink;
  ctx.font = `bold 17px 'Architects Daughter', cursive`;
  ctx.fillText(info.name, x + 12, y + 56, w - 24);
  ctx.restore();
  ctx.strokeStyle = 'rgba(55, 95, 155, 0.45)';  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x + 8, y + 66); ctx.lineTo(x + w - 8, y + 66); ctx.stroke();

  // Picture area
  const ay = y + 68, ah = h - 68 - 52;
  if (open) {
    ctx.save();
    ctx.beginPath(); ctx.rect(x + 4, ay, w - 8, ah); ctx.clip();
    drawLevelIcon(c.n, x + w / 2, ay + ah / 2, Math.min(ah * 0.46, w * 0.24));
    ctx.restore();
  } else {
    drawPadlock(x + w / 2, ay + ah / 2 - 2, Math.min(ah * 0.6, 54));
  }

  // Stamps
  if (cleared) {
    ctx.save();
    ctx.translate(x + w - 56, ay + ah - 22);  ctx.rotate(-0.28);
    const gold = best === 3;
    ctx.strokeStyle = gold ? '#B8860B' : C.accent;  ctx.fillStyle = ctx.strokeStyle;
    ctx.globalAlpha = e * 0.8;  ctx.lineWidth = 2.2;
    ctx.strokeRect(-38, -12, 76, 24);
    ctx.font = `bold 14px 'Architects Daughter', cursive`;  ctx.textAlign = 'center';  ctx.textBaseline = 'middle';
    ctx.fillText(gold ? 'PERFECT' : 'CLEARED', 0, 1);
    ctx.restore();
  }
  if (current) {
    ctx.save();
    ctx.translate(x + w - 8, y + 6);  ctx.rotate(0.35);
    ctx.fillStyle = C.accent;  ctx.fillRect(-26, -10, 52, 20);
    ctx.fillStyle = '#fff';  ctx.font = `bold 12px 'Architects Daughter', cursive`;
    ctx.textAlign = 'center';  ctx.textBaseline = 'middle';
    ctx.fillText('NEXT UP', 0, 1);
    ctx.restore();
  }

  // Footer: stars + button
  const fy = y + h - 42;
  ctx.strokeStyle = 'rgba(55, 95, 155, 0.25)';  ctx.lineWidth = 1;  ctx.setLineDash([3, 4]);
  ctx.beginPath(); ctx.moveTo(x + 8, fy - 4); ctx.lineTo(x + w - 8, fy - 4); ctx.stroke();  ctx.setLineDash([]);
  for (let i = 0; i < 3; i++) {
    ctx.save();
    ctx.lineJoin = 'round';  ctx.lineWidth = 1.6;  ctx.strokeStyle = open ? C.ink : C.inkLight;
    ctx.fillStyle = i < best ? 'rgba(235, 185, 60, 0.98)' : 'rgba(0,0,0,0.04)';
    starPath(x + 22 + i * 27, fy + 20, 11);
    ctx.fill();  ctx.stroke();
    ctx.restore();
  }
  if (open) {
    const bw = 92, bh = 30, bx = x + w - bw - 10, by = fy + 5;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.12)';  ctx.fillRect(bx + 2, by + 2, bw, bh);
    ctx.fillStyle = hov ? C.ink : (current ? C.accent : col);  ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = '#fff';  ctx.font = `bold 14px 'Architects Daughter', cursive`;
    ctx.textAlign = 'center';  ctx.textBaseline = 'middle';
    ctx.fillText(cleared ? '↻ REPLAY' : '▶ LAUNCH', bx + bw / 2, by + bh / 2 + 1);
    ctx.restore();
  } else {
    ctx.save();
    ctx.fillStyle = C.inkMid;  ctx.font = `14px 'Patrick Hand', cursive`;
    ctx.textAlign = 'right';  ctx.textBaseline = 'middle';
    ctx.fillText(`clear level ${c.n - 1} first`, x + w - 12, fy + 20);
    ctx.restore();
  }
  ctx.restore();
}

/** A laser loops around the grid, bouncing off a small tile at each corner */
function drawLevelBeam(R) {
  const m = 20;
  const x1 = R.gx - m, x2 = R.gx + R.gw + m, y1 = R.top - m, y2 = R.top + 2 * R.ch + R.gap + m;
  const pts = [[x1, y1], [x2, y1], [x2, y2], [x1, y2], [x1, y1]];
  const segs = [];  let total = 0;
  for (let i = 0; i < 4; i++) { const l = Math.hypot(pts[i+1][0] - pts[i][0], pts[i+1][1] - pts[i][1]); segs.push(l); total += l; }
  const at = d => {
    d = ((d % total) + total) % total;
    for (let i = 0; i < 4; i++) {
      if (d <= segs[i]) { const f = d / segs[i]; return [pts[i][0] + (pts[i+1][0] - pts[i][0]) * f, pts[i][1] + (pts[i+1][1] - pts[i][1]) * f]; }
      d -= segs[i];
    }
    return pts[0];
  };
  LS.d += 4.2;
  const tail = 220;

  ctx.save();
  // Faint guide path
  ctx.strokeStyle = 'rgba(90, 130, 200, 0.22)';  ctx.lineWidth = 1;  ctx.setLineDash([4, 6]);
  ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);  ctx.setLineDash([]);
  // Corner tiles: "/" at top-left and bottom-right, "\" at top-right and bottom-left
  ctx.strokeStyle = C.ink;  ctx.lineWidth = 3;  ctx.lineCap = 'round';
  pts.slice(0, 4).forEach(([px, py], i) => {
    const dir = (i === 0 || i === 2) ? -1 : 1;
    ctx.beginPath(); ctx.moveTo(px - 9, py - 9 * dir); ctx.lineTo(px + 9, py + 9 * dir); ctx.stroke();
  });
  // Beam trail
  ctx.lineWidth = 3;
  for (let k = 0; k < tail; k += 6) {
    const [ax, ay] = at(LS.d - k), [bx, by] = at(LS.d - k - 6);
    if (Math.hypot(ax - bx, ay - by) > 12) continue;       // don't draw across a corner jump
    ctx.strokeStyle = `rgba(192, 57, 43, ${(1 - k / tail) * 0.85})`;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
  }
  const [hx, hy] = at(LS.d);
  const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 16);
  g.addColorStop(0, 'rgba(255, 190, 120, 0.95)');  g.addColorStop(0.5, 'rgba(220, 80, 40, 0.5)');  g.addColorStop(1, 'rgba(192, 57, 43, 0)');
  ctx.fillStyle = g;  ctx.beginPath(); ctx.arc(hx, hy, 16, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawLevels() {
  const R = levelRects();
  drawRulers();
  drawDoodles();

  // Title block
  const tw = 540, th = 82, tx = W / 2 - tw / 2, ty = 30;
  ctx.save();  ctx.fillStyle = 'rgba(255,255,255,0.88)';  ctx.fillRect(tx, ty, tw, th);  ctx.restore();
  sketchRect(tx, ty, tw, th, 2.5, C.ink);
  ctx.save();
  ctx.textAlign = 'center';  ctx.fillStyle = C.ink;
  ctx.font = `bold 32px 'Architects Daughter', cursive`;
  ctx.fillText('REFRACT // STAGE SELECT', W / 2, ty + 37);
  ctx.strokeStyle = C.inkMid;  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(tx + 8, ty + 48); ctx.lineTo(tx + tw - 8, ty + 48); ctx.stroke();
  ctx.fillStyle = C.inkMid;  ctx.font = `16px 'Patrick Hand', cursive`;
  ctx.textAlign = 'left';   ctx.fillText('SHEET NO.  02 - LEVEL ARCHIVES', tx + 12, ty + 68);
  ctx.textAlign = 'right';  ctx.fillText('SCALE 1:1', tx + tw - 12, ty + 68);
  ctx.restore();
  ctx.save();
  ctx.textAlign = 'center';  ctx.fillStyle = C.inkMid;  ctx.font = `19px 'Patrick Hand', cursive`;
  ctx.fillText('pick a sheet  ·  clear a level to unlock the next  ·  3 stars = no misses', W / 2, ty + th + 28);
  ctx.restore();
  wavyLine(W / 2 - 150, W / 2 + 150, ty + th + 38, 3, C.accent);

  drawLevelBeam(R);

  LS.hover = 0;
  for (const c of R.cards) if (inRect(mouse, c)) LS.hover = c.n;
  for (const c of R.cards) drawLevelCard(c, LS.hover === c.n);

  // Bottom bar
  drawBtn(R.back.x, R.back.y, R.back.w, R.back.h, '←   MAIN MENU', C.inkMid);
  drawBtn(R.sound.x, R.sound.y, R.sound.w, R.sound.h, sfx.isMuted() ? '♪  SOUND OFF' : '♪  SOUND ON', C.inkMid);
  const sb = R.stars;
  ctx.save();  ctx.fillStyle = 'rgba(255,255,255,0.82)';  ctx.fillRect(sb.x, sb.y, sb.w, sb.h);  ctx.restore();
  ctx.save();  ctx.fillStyle = 'rgba(235, 185, 60, 0.4)';  ctx.fillRect(sb.x + 3, sb.y + 3, (sb.w - 6) * totalStars() / (TOTAL_LEVELS * 3), sb.h - 6);  ctx.restore();
  sketchRect(sb.x, sb.y, sb.w, sb.h, 2, C.ink);
  ctx.save();
  ctx.textAlign = 'center';  ctx.textBaseline = 'middle';  ctx.fillStyle = C.ink;
  ctx.font = `bold 20px 'Architects Daughter', cursive`;
  ctx.fillText(`★  TOTAL STARS: ${totalStars()}/${TOTAL_LEVELS * 3}`, sb.x + sb.w / 2, sb.y + sb.h / 2 + 1);
  ctx.restore();

  // "locked" note
  if (LS.noteT > 0) {
    LS.noteT--;
    ctx.save();
    ctx.globalAlpha = Math.min(1, LS.noteT / 30);
    ctx.textAlign = 'center';  ctx.fillStyle = C.accent;  ctx.font = `bold 22px 'Patrick Hand', cursive`;
    ctx.fillText(LS.note, W / 2, H - 84);
    ctx.restore();
  }
}

// ── MAIN LOOP ─────────────────────────────────────────────────────────────────
function loop() {
  frame++;
  sfx.music(state === 'PLAYING' ? LEVEL.num : 1, state === 'PLAYING' && play.won);
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
  } else if (state === 'LEVELS') {
    drawLevels();
  } else if (state === 'PLAYING') {
    drawDoodles();
    drawPlaying();
  }

  // Cursor reflects what is under the mouse
  let cur = 'default';
  if (state === 'PLAYING') {
    const B = WIN_BTNS();
    if (play.won) cur = (inRect(mouse, B.again) || inRect(mouse, B.menu)) ? 'pointer' : 'default';
    else cur = inRect(mouse, PLAY_MENU_BTN()) ? 'pointer' : 'crosshair';
  }
  else if (state === 'MENU') {
    const R = menuRects();
    if (drag) cur = 'grabbing';
    else if (hoverMirror) cur = 'grab';
    else if (inRect(mouse, R.play) || inRect(mouse, R.how)) cur = 'pointer';
  } else if (state === 'HOWTO') {
    if (inRect(mouse, HOWTO_BACK())) cur = 'pointer';
  } else if (state === 'LEVELS') {
    const R = levelRects();
    if (inRect(mouse, R.back) || inRect(mouse, R.sound) || (LS.hover && isUnlocked(LS.hover))) cur = 'pointer';
  }
  drawFade();
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
  if (state === 'PLAYING' && drawing) {
    const e2 = limitTileEnd(drawing.x1, drawing.y1, p.x, p.y);
    drawing.x2 = e2.x;  drawing.y2 = e2.y;
    return;
  }
  if (state !== 'MENU') return;
  if (drag) dragMirror(p.x, p.y);
  else { const pk = pickMirror(p.x, p.y); hoverMirror = pk ? pk.m : null; }
});

canvas.addEventListener('pointerdown', e => {
  sfx.unlock();                      // browsers only allow sound after a click
  const p = toCanvas(e);
  mouse.x = p.x;  mouse.y = p.y;
  if (state === 'PLAYING') {
    if (!play.won && !paused) startTile(p.x, p.y);
    if (drawing) canvas.setPointerCapture(e.pointerId);
    return;
  }
  if (state !== 'MENU') return;
  const pk = pickMirror(p.x, p.y);
  if (pk) {
    drag = { m: pk.m, mode: pk.mode, ox: p.x, oy: p.y };
    canvas.setPointerCapture(e.pointerId);
  }
});

canvas.addEventListener('pointerup', () => { drag = null; finishTile(); });
canvas.addEventListener('pointercancel', () => { drag = null; drawing = null; });

canvas.addEventListener('click', e => {
  const p = toCanvas(e);
  if (state === 'MENU') {
    const R = menuRects();
    if (inRect(p, R.play)) { sfx.click(); goTo('LEVELS'); }
    else if (inRect(p, R.how)) { sfx.click(); goTo('HOWTO'); }
  } else if (state === 'HOWTO') {
    if (inRect(p, HOWTO_BACK())) { sfx.click(); goTo('MENU'); }
  } else if (state === 'LEVELS') {
    const R = levelRects();
    if (inRect(p, R.back)) { sfx.click(); goTo('MENU'); }
    else if (inRect(p, R.sound)) sfx.toggle();
    else for (const c of R.cards) if (inRect(p, c)) {
      if (isUnlocked(c.n)) { sfx.click(); startGame(c.n); goTo('PLAYING'); }
      else { LS.note = `Clear level ${c.n - 1} first!`; LS.noteT = 120; sfx.denied(); }
    }
  } else if (state === 'PLAYING') {
    if (paused) { paused = false; return; }
    if (play.won) {
      const B = WIN_BTNS();
      if (inRect(p, B.again)) { sfx.click(); if (LEVEL.num === TOTAL_LEVELS) startGame(); else nextLevel(); }
      else if (inRect(p, B.menu)) { sfx.click(); goTo('LEVELS'); }
    } else if (inRect(p, PLAY_MENU_BTN())) {
      sfx.click();
      goTo('LEVELS');
    }
  }
});

document.addEventListener('keydown', e => {
  sfx.unlock();
  if (e.key === 'm' || e.key === 'M') sfx.toggle();
  if ((e.key === 'p' || e.key === 'P' || e.key === ' ') && state === 'PLAYING' && !play.won) { paused = !paused; drawing = null; e.preventDefault(); }
  if (e.key === 'Escape' && state !== 'MENU') { drawing = null; goTo(state === 'PLAYING' ? 'LEVELS' : 'MENU'); }
});

window.addEventListener('blur', () => { if (state === 'PLAYING' && !play.won) { paused = true; drawing = null; } });

// ── START ─────────────────────────────────────────────────────────────────────
layout();
requestAnimationFrame(loop);
