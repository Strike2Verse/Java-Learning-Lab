import java.awt.Color;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import javax.swing.JPanel;

public class GamePanel extends JPanel {

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g); // clears the panel first — always call this

        // ---- basic shapes ----
        g.setColor(Color.RED);
        g.fillRect(50, 50, 100, 80); // filled rectangle: x, y, width, height

        g.setColor(Color.BLUE);
        g.fillOval(200, 50, 60, 60);   // filled circle
        g.drawRect(300, 50, 60, 40);   // outlined rectangle (not filled)
        g.drawLine(50, 200, 350, 200); // a line

        g.setColor(Color.BLACK);
        g.drawString("Score: 0", 10, 20); // text

        // ---- Graphics2D: more control (anti-aliasing) ----
        // Casting Graphics -> Graphics2D is valid because Graphics2D
        // EXTENDS Graphics with more capabilities — the same downcasting
        // pattern covered in Polymorphism.
        Graphics2D g2d = (Graphics2D) g;
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        g2d.setColor(Color.GREEN);
        g2d.fillOval(200, 150, 60, 60); // smoother edges than the plain fillOval above
    }
}