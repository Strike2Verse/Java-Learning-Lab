# ✏️ Refract

**Refract** is a real-time laser drawing puzzle game built in HTML5 Canvas and vanilla JavaScript. No frameworks, no libraries — just a single HTML file opened in any browser.

> *Draw the path. Bend the light. Get it in the hole.*

---

## 🎯 Gameplay

A laser fires from the left wall and travels across the screen in real time.

You **click and drag** to draw a reflector line on the screen. The laser hits your line and bounces off at the matching angle.

Your goal: guide the laser beam into the **hole** on the right wall before it hits an obstacle.

The laser gets faster every level. Your drawn lines have a length limit — you can't cover everything.

### Controls

| Input | Action |
|-------|--------|
| Click + Drag | Draw a reflector line |
| Click existing line | Erase it |
| `ESC` | Return to menu |

---

## ▶️ How to Open

No installation. No compilation. Just:

1. Open `Capstone-Refract/` in File Explorer
2. Double-click `index.html`
3. It opens in your default browser — done

---

## 🗺️ Development Phases

| Phase | Description | Status |
|-------|-------------|--------|
| **1** | Title screen, paper/pencil theme, animated demo laser | ✅ Done |
| **2** | Play area, laser source, hole/goal — static display | 🟡 Next |
| **3** | Real-time laser movement | ⬜ |
| **4** | Player draws reflector lines (click + drag) | ⬜ |
| **5** | Laser reflects off player lines (physics) | ⬜ |
| **6** | Win/lose conditions | ⬜ |
| **7** | Stone wall + absorber obstacles | ⬜ |
| **8** | Speed increase per level | ⬜ |
| **9** | More obstacles (bouncers, timed blocks, moving walls) | ⬜ |
| **10** | Level system — 5 designed levels | ⬜ |
| **11** | Sound effects | ⬜ |
| **12** | Visual polish + high score | ⬜ |

---

## 🛠️ Tech Stack

```
Capstone-Refract/
├── index.html   — HTML shell, Google Fonts
├── style.css    — Paper background, canvas shadow
└── game.js      — Everything: rendering, physics, input, game logic
```

| Concept | Where Used |
|---------|-----------|
| HTML5 Canvas 2D API | All rendering |
| `requestAnimationFrame` | 60 fps game loop |
| Vector reflection math | Laser physics (`game.js`) |
| Pre-rendered offscreen canvas | Paper texture (performance) |
| Segment intersection geometry | Line-laser collision detection |
| Vanilla JS state machine | `MENU` → `PLAYING` → `WIN` / `LOSE` |

---

## 🎨 Visual Theme

Warm paper / pencil sketch aesthetic inspired by blueprint drafting paper.

- Background: warm cream `#F6F1E9` with grain noise
- Grid: faint blueprint-blue lines
- Laser: deep red `#C0392B` with glow trail
- Reflector lines: dark charcoal, hand-drawn style
- Obstacles: hatched rectangles (blueprint wall style)
- UI: sketch-style outlined buttons, `Caveat` handwriting font
