import javax.swing.JFrame;

public class Java2DBasicsDemo {
    public static void main(String[] args) {

        // ---- displaying the GamePanel in a window ----
        JFrame frame = new JFrame("Java2D Basics Demo");
        frame.add(new GamePanel());
        frame.setSize(800, 600);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setVisible(true);

        // paintComponent() is called automatically by Swing whenever the
        // panel needs to redraw — it is never called directly.
    }
}