# ✏️ Refract

**Refract** is a laser-steering puzzle game built with HTML5 Canvas and vanilla JavaScript. No frameworks, no libraries — just open `index.html` in any browser.

> *Bend the light. Get it in the hole.*

---

## 🎯 The Game

A laser beam fires from the **emitter** on the left wall and keeps moving — you can't slow it down or stop it.
The only thing you control is **its direction**.

Place and move **mirrors** (reflector lines). When the beam hits a mirror it bounces off at the matching angle.
Steer it, bounce by bounce, until it lands in the **goal hole** on the right wall.

1. **Aim** — move and rotate the mirrors
2. **Bounce** — the beam reflects off each mirror
3. **Score** — land the beam in the goal hole

---

## 🕹️ What Works Right Now

### Home screen
- Fills the whole browser window and resizes with it
- Drafting-sheet look: paper texture, blueprint grid, edge rulers, pencil doodles, title block
- A live laser beam bounces around the whole screen — off the screen edges, the title and the buttons
- **Drag the mirrors** to steer the beam; drag a mirror's end to rotate it, drag its middle to move it
- Land the beam in the **GOAL** ring to count a hit
- **HOW TO PLAY** screen explains the game

### Controls

| Input | Action |
|-------|--------|
| Click + drag a mirror's middle (home screen) | Move the mirror |
| Click + drag a mirror's end (home screen) | Rotate / resize the mirror |
| Click `HOW TO PLAY` | Open the how-to-play screen |
| `ESC` | Return to the home screen |

---

## ▶️ How to Open

No installation. No compilation. Just:

1. Open the `Capstone-Refract/` folder in File Explorer
2. Double-click `index.html`
3. It opens in your default browser — done

---

## 🗺️ Progress

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Title screen, paper/pencil theme, bouncing laser | ✅ Done |
| 2 | Play area, laser source, goal hole (static, not connected to the PLAY button yet) | ✅ Done |
| 3 | Home screen redesign: full-window layout, interactive beam and mirrors, how-to-play screen | ✅ Done |

---

## 🛠️ Tech Stack

```
Capstone-Refract/
├── index.html   — HTML shell, Google Fonts
├── style.css    — Full-window canvas, paper background
└── game.js      — Rendering, beam physics, input, screens
```

| Concept | Where Used |
|---------|-----------|
| HTML5 Canvas 2D API | All rendering |
| `requestAnimationFrame` | 60 fps game loop |
| Window `resize` handling | Full-window canvas and layout |
| Vector reflection math | Beam bouncing off mirrors, title and buttons |
| Segment intersection geometry | Beam–mirror collision |
| Pointer events | Dragging mirrors (mouse and touch) |
| Pre-rendered offscreen canvas | Paper texture (performance) |
| Vanilla JS state machine | `MENU` · `HOWTO` · `PLAYING` |

---

## 🎨 Visual Theme

Warm paper / pencil-sketch aesthetic inspired by blueprint drafting paper.

- Background: warm cream `#F6F1E9` with grain noise
- Grid and rulers: faint blueprint blue
- Beam: deep red `#C0392B` with a fading trail and glowing head
- Mirrors: dark charcoal lines
- UI: sketch-style outlined buttons, `Caveat` handwriting font
