# 🔴 Signal Loss

**Signal Loss** is a standalone retro-cyberpunk 2D grid puzzle game built entirely in Java — no external game engine, no libraries. It is the capstone project for this Java learning laboratory, combining concepts studied across the full roadmap: OOP, threading, audio synthesis, state-space pathfinding, and procedural level generation.

---

## 🎯 Gameplay

You control a **data packet** navigating a decaying circuit grid. Traverse nodes and reach the **Exit (Uplink)** before your signal strength drops to **0%**.

Every step costs **−10%** base signal. Plan your route — or run out of power.

### Node Types

| Node | Effect |
|------|--------|
| 🟢 **Boost** | Restores **+20%** signal. Consumed after one visit. |
| 🔴 **Hazard** | Deals an extra **−15%** damage on entry. |
| 🟠 **Teleport** | Instantly warps the packet to a linked distant node. |
| 🟡 **Flip** | Toggles ONLINE ↔ OFFLINE every N steps — acts as a timed wall. |
| ⚪ **Exit (Uplink)** | Reach this node to complete the level. |

---

## ▶️ How to Run

```bash
# Compile  (from repo root)
javac Capstone-SignalLoss/*.java

# Run
java -cp Capstone-SignalLoss SignalLossGame
```

Requires **Java 8+**. No additional dependencies.

### Controls

| Key | Action |
|-----|--------|
| `W A S D` or Arrow Keys | Move between connected nodes |
| `Space` | Generate a new verified-solvable level |
| `R` | Restart current level |
| `V` | Cycle volume (100% → 50% → mute) |
| `ESC` | Return to main menu |

---

## 🛠️ Architecture

```
Capstone-SignalLoss/
├── SignalLossGame.java   — JFrame entry point
├── GamePanel.java        — Game loop, rendering, input, UI, particles, combos
├── Node.java             — Grid junction model (type, position, state)
├── Packet.java           — Player entity (signal, steps, movement logic)
├── LevelSolver.java      — BFS solver that verifies generated levels are solvable
└── SoundManager.java     — Programmatic 8-bit audio synthesis (javax.sound.sampled)
```

---

## 🧠 Java Concepts Applied

| Concept | Where Used |
|---------|-----------|
| OOP — classes, inheritance, enums | `Node`, `Packet`, `GameState` |
| `javax.swing` + `java.awt` | `GamePanel` rendering pipeline |
| Multithreading | `SoundManager` daemon threads |
| BFS pathfinding | `LevelSolver.solve()` |
| Procedural generation | `GamePanel.generateRandom()` |
| Audio synthesis | Sine/square waves at 44100 Hz |
| 60 fps game loop | `javax.swing.Timer` at 16 ms |
| Particle systems | `GamePanel.Particle` inner class |
