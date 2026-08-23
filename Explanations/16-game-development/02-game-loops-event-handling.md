# Game Loops and Event Handling

## What a game loop is

Unlike a normal program that runs once and finishes, a game needs to
continuously update state and redraw the screen, many times per second.
This repeating cycle is the "game loop."

## Basic game loop structure

```java
public class GameLoop implements Runnable {
    private boolean running = true;

    public void run() {
        while (running) {
            update();  // move things, check collisions, etc.
            render();  // redraw the screen
            sleep();   // control the speed of the loop
        }
    }

    private void sleep() {
        try {
            Thread.sleep(16); // ~60 frames per second (1000ms / 60 ≈ 16ms)
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
```

Uses `Thread` and `Runnable` directly from Multithreading — the game
loop runs on its own thread, separate from the GUI's main thread, so the
game can keep updating even while waiting for user input.

## Using a javax.swing.Timer (simpler alternative)

```java
import javax.swing.Timer;

Timer timer = new Timer(16, e -> {
    updateGame();
    repaint(); // triggers paintComponent() to run again
});
timer.start();
```

`Timer`'s callback runs on Swing's **Event Dispatch Thread (EDT)** — the
one thread Swing components are safe to update from. This avoids the
thread-safety issues that come with manually updating Swing components
from a separately managed thread.

## Keyboard input with KeyListener

```java
import java.awt.event.KeyListener;
import java.awt.event.KeyEvent;

public class GamePanel extends JPanel implements KeyListener {

    private int playerX = 100;

    public GamePanel() {
        setFocusable(true); // needed to receive key events
        addKeyListener(this);
    }

    @Override
    public void keyPressed(KeyEvent e) {
        if (e.getKeyCode() == KeyEvent.VK_RIGHT) {
            playerX += 5;
        } else if (e.getKeyCode() == KeyEvent.VK_LEFT) {
            playerX -= 5;
        }
        repaint();
    }

    @Override
    public void keyReleased(KeyEvent e) {}
    @Override
    public void keyTyped(KeyEvent e) {}
}
```

`KeyListener` is an interface with three abstract methods — all three
must be implemented, even if some stay empty, per the interface contract
rule from Abstraction.

## Mouse input with MouseListener

```java
import java.awt.event.MouseListener;
import java.awt.event.MouseEvent;

public void mouseClicked(MouseEvent e) {
    int x = e.getX();
    int y = e.getY();
    System.out.println("Clicked at: " + x + ", " + y);
}
// mousePressed, mouseReleased, mouseEntered, mouseExited also required
```

## Combining it all: a simple moving square

```java
public class GamePanel extends JPanel implements KeyListener {
    private int x = 100, y = 100;

    public GamePanel() {
        setFocusable(true);
        addKeyListener(this);
        Timer timer = new Timer(16, e -> repaint());
        timer.start();
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        g.fillRect(x, y, 50, 50);
    }

    @Override
    public void keyPressed(KeyEvent e) {
        if (e.getKeyCode() == KeyEvent.VK_RIGHT) x += 5;
        if (e.getKeyCode() == KeyEvent.VK_LEFT) x -= 5;
    }

    @Override public void keyReleased(KeyEvent e) {}
    @Override public void keyTyped(KeyEvent e) {}
}
```

## Practice Program

See:
- [`GameLoop.java`](../../Code/16-game-development/02-game-loops-event-handling/GameLoop.java) —
  a manual `Thread`/`Runnable`-based game loop (console demo, limited to
  5 frames)
- [`GamePanel.java`](../../Code/16-game-development/02-game-loops-event-handling/GamePanel.java) —
  a `Timer`-based interactive panel with keyboard and mouse input moving
  a square
- [`GameLoopsEventHandlingDemo.java`](../../Code/16-game-development/02-game-loops-event-handling/GameLoopsEventHandlingDemo.java) —
  runs both: the manual game loop first, then opens the interactive
  window

### Compiling and running

This opens a GUI window, so it needs a display environment to run:

```bash
cd Code/16-game-development/02-game-loops-event-handling
javac GameLoopsEventHandlingDemo.java GamePanel.java GameLoop.java
java GameLoopsEventHandlingDemo
```

Use the arrow keys or click anywhere in the window to move the square.