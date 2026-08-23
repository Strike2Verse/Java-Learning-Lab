# Java2D Basics

Java2D is part of the JDK itself (`java.awt`, `javax.swing`) — no
external library needed for basic 2D graphics. It's the foundation for
drawing shapes, images, and text, which is exactly what simple games
need.

## The core setup: a JPanel for drawing

```java
import javax.swing.JPanel;
import javax.swing.JFrame;
import java.awt.Graphics;
import java.awt.Color;

public class GamePanel extends JPanel {

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g); // clears the panel first — always call this
        g.setColor(Color.RED);
        g.fillRect(50, 50, 100, 80); // x, y, width, height
    }
}
```

`paintComponent` is called automatically by Swing whenever the panel
needs to redraw — it is never called directly.

## Displaying it in a window

```java
JFrame frame = new JFrame("My Game");
frame.add(new GamePanel());
frame.setSize(800, 600);
frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
frame.setVisible(true);
```

## Drawing different shapes

```java
g.setColor(Color.BLUE);
g.fillOval(100, 100, 50, 50);        // filled circle
g.drawRect(200, 100, 60, 40);         // outlined rectangle (not filled)
g.drawLine(0, 0, 100, 100);           // a line

g.setColor(Color.BLACK);
g.drawString("Score: 0", 10, 20);     // text
```

`fillRect`/`fillOval` draw solid shapes; `drawRect` (and similar `draw*`
methods) draw only the outline.

## Drawing an image

```java
import javax.swing.ImageIcon;
import java.awt.Image;

Image sprite = new ImageIcon("player.png").getImage();

@Override
protected void paintComponent(Graphics g) {
    super.paintComponent(g);
    g.drawImage(sprite, 100, 100, this); // x, y, ImageObserver (usually 'this')
}
```

## Using Graphics2D for more control

```java
Graphics2D g2d = (Graphics2D) g; // Graphics2D is a more powerful subclass

g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
g2d.fillOval(100, 100, 50, 50); // smoother edges now
```

The cast from `Graphics` to `Graphics2D` is valid because `Graphics2D`
**extends** `Graphics` with more capabilities — the same downcasting
pattern covered in Polymorphism (a parent-type reference actually holding
a more specific subtype object).

## Practice Program

See:
- [`GamePanel.java`](../../Code/16-game-development/01-java2d-basics/GamePanel.java) —
  a `JPanel` drawing shapes, text, and using `Graphics2D` for
  anti-aliasing
- [`Java2DBasicsDemo.java`](../../Code/16-game-development/01-java2d-basics/Java2DBasicsDemo.java) —
  displays the panel in a `JFrame` window

### Compiling and running

This opens a GUI window, so it needs a display environment (a normal
desktop) to run:

```bash
cd Code/16-game-development/01-java2d-basics
javac Java2DBasicsDemo.java GamePanel.java
java Java2DBasicsDemo
```