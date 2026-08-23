import javax.swing.JFrame;

public class GameLoopsEventHandlingDemo {
    public static void main(String[] args) {

        // ---- manual Thread-based game loop (console demo, 5 frames) ----
        System.out.println("-- manual game loop (Thread/Runnable) --");
        Thread loopThread = new Thread(new GameLoop());
        loopThread.start();

        try {
            loopThread.join(); // wait for the 5-frame demo loop to finish
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        System.out.println("--------------------");

        // ---- interactive window: Timer-based loop + keyboard/mouse input ----
        System.out.println("Opening interactive window (use arrow keys or click to move the square)...");
        JFrame frame = new JFrame("Game Loops and Event Handling Demo");
        frame.add(new GamePanel());
        frame.setSize(800, 600);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setVisible(true);
    }
}