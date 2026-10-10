# ✏️ Refract

**Refract** is a laser-steering puzzle game built with HTML5 Canvas and vanilla JavaScript. No frameworks, no libraries — just open `index.html` in any browser.

> *Bend the light. Get it in the hole.*

---

## 🎯 The Game

A laser beam fires from the **emitter** on the left wall and keeps moving — you can't slow it down or stop it.
The only thing you control is **its direction**.

Draw **tiles** (short reflector lines) with the mouse. When the beam hits a tile it bounces off at the matching angle.
Steer it, bounce by bounce, until it lands in the **goal hole** on the right wall.

- You can draw as many tiles as you like over time, but only **3 can exist at once** — draw a 4th and the oldest disappears
- Each tile has a **short maximum length**, so every tile has to be placed precisely

1. **Aim** — draw a tile where you want the beam to turn
2. **Bounce** — the beam reflects off each tile
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

### Play screen
- Opens from the **PLAY** button
- Blueprint-style play area with hatched walls, the laser source on the left and the goal hole on the right
- The laser beam (same trail-and-glow beam as the home screen) fires from the source and keeps going
- **Click + drag** inside the play area to draw a tile; the beam bounces off it
- Only 3 tiles at a time — the 4th makes the oldest fade away (the oldest is shown a little lighter)
- Tiles have a maximum length (120px) — a dashed preview line stops growing at the limit
- **Stone walls** (grey hatched blocks) absorb the beam — that counts as a miss. Tiles can't be drawn through them (the preview turns red)
- When the beam hits a wall it sparks, rests for a moment, then fires again
- The HUD shows `TILES: n/3` and the maximum length
- **8 random levels:** every level is generated fresh each time you play, and is always winnable (a hidden solution is planned first, then extras are placed around it). The beam gets faster each level (SLOW → MEDIUM → FAST → VERY FAST → INSANE); the HUD shows `LEVEL n/8` and the speed
- **Stars (★):** from level 2, the beam must touch every star before the goal opens. A dashed ring around the goal shows how many are left; reaching it early counts as a miss
- **Portals:** from level 3, the beam enters one portal and leaves the other in the same direction
- **Blinking blocks:** from level 4, red blocks that are solid for a moment, then switch off (a dashed outline flashes just before they turn solid)
- **Sliding bars:** from level 5, blue stone bars that slide up and down along a dotted track — time your shot
- Level 7 adds a second blinking block; the beam rests for a random time after a miss so timing can't get stuck
- **Win:** when the beam reaches the goal hole, a **GOAL!** screen shows how many misses it took, with **NEXT LEVEL** and **MENU** buttons
- After level 8 an **ALL CLEAR!** screen shows your total misses, with **PLAY AGAIN** (back to level 1) and **MENU**
- Hitting any other part of a wall counts as a miss; the HUD shows `MISSES: n`

### Controls

| Input | Action |
|-------|--------|
| Click + drag a mirror's middle (home screen) | Move the mirror |
| Click + drag a mirror's end (home screen) | Rotate / resize the mirror |
| Click `PLAY` | Open the play screen |
| Click + drag (play screen) | Draw a tile (max length, 3 at a time) |
| Click `HOW TO PLAY` | Open the how-to-play screen |
| Click `← MENU` (play screen) | Return to the home screen |
| Click `NEXT LEVEL` / `PLAY AGAIN` / `MENU` (after winning) | Go to the next level (or restart from level 1 after the last) / return to the home screen |
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
| 2 | Play area, laser source, goal hole (static) | ✅ Done |
| 3 | Home screen redesign: full-window layout, interactive beam and mirrors, how-to-play screen | ✅ Done |
| 4 | PLAY button opens the play screen (moving beam, menu button to go back) | ✅ Done |
| 5 | Draw tiles with click + drag (max length, 3 at a time) and the beam bounces off them | ✅ Done |
| 6 | Win condition: beam in the goal hole shows a GOAL! screen; misses are counted | ✅ Done |
| 7 | Stone wall obstacles that absorb the beam and block tiles | ✅ Done |
| 8 | 5 levels with a faster beam each level, NEXT LEVEL and ALL CLEAR screens | ✅ Done |
| 9 | Random, always-winnable levels (8) with stars, portals, blinking blocks and sliding bars | ✅ Done |

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
| Vector reflection math | Beam bouncing off mirrors, tiles, title and buttons |
| Segment intersection geometry | Beam–mirror and beam–tile collision |
| Pointer events | Dragging mirrors and drawing tiles (mouse and touch) |
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
