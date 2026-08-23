import java.awt.Color;
import java.awt.Graphics;
import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;
import java.awt.event.MouseEvent;
import java.awt.event.MouseListener;
import javax.swing.JPanel;
import javax.swing.Timer;

public class GamePanel extends JPanel implements KeyListener, MouseListener {

    private int x = 100;
    private int y = 100;

    public GamePanel() {
        setFocusable(true); // needed to receive key events
        addKeyListener(this);
        addMouseListener(this);

        // Timer runs its callback on Swing's Event Dispatch Thread (EDT),
        // which is the safe thread for updating Swing components —
        // simpler and safer than manually managing a Thread here.
        Timer timer = new Timer(16, e -> repaint()); // ~60 frames per second
        timer.start();
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        g.setColor(Color.BLUE);
        g.fillRect(x, y, 50, 50);
    }

    // ---- KeyListener: interface requires ALL three methods implemented ----
    @Override
    public void keyPressed(KeyEvent e) {
        if (e.getKeyCode() == KeyEvent.VK_RIGHT) x += 5;
        if (e.getKeyCode() == KeyEvent.VK_LEFT) x -= 5;
        if (e.getKeyCode() == KeyEvent.VK_DOWN) y += 5;
        if (e.getKeyCode() == KeyEvent.VK_UP) y -= 5;
    }

    @Override
    public void keyReleased(KeyEvent e) {
        // not needed for this example, but required by the interface
    }

    @Override
    public void keyTyped(KeyEvent e) {
        // not needed for this example, but required by the interface
    }

    // ---- MouseListener: interface requires ALL five methods implemented ----
    @Override
    public void mouseClicked(MouseEvent e) {
        System.out.println("Clicked at: " + e.getX() + ", " + e.getY());
        x = e.getX();
        y = e.getY();
    }

    @Override
    public void mousePressed(MouseEvent e) {
    }

    @Override
    public void mouseReleased(MouseEvent e) {
    }

    @Override
    public void mouseEntered(MouseEvent e) {
    }

    @Override
    public void mouseExited(MouseEvent e) {
    }
}