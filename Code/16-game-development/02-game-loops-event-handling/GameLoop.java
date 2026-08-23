// A manual game loop using Thread/Runnable directly, shown for
// comparison against the javax.swing.Timer approach in GamePanel.java.
// This ties directly back to Multithreading — the loop runs on its own
// thread, separate from the GUI's main thread.
public class GameLoop implements Runnable {
    private volatile boolean running = true;
    private int frameCount = 0;

    @Override
    public void run() {
        while (running && frameCount < 5) { // limited to 5 frames for this demo
            update();
            render();
            sleep();
            frameCount++;
        }
        System.out.println("Game loop finished.");
    }

    private void update() {
        System.out.println("Updating game state... (frame " + frameCount + ")");
    }

    private void render() {
        System.out.println("Rendering frame " + frameCount);
    }

    private void sleep() {
        try {
            Thread.sleep(16); // ~60 frames per second (1000ms / 60 ~= 16ms)
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    public void stop() {
        running = false;
    }
}