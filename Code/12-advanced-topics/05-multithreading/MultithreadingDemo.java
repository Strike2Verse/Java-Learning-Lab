public class MultithreadingDemo {
    public static void main(String[] args) throws InterruptedException {

        // ---- creating a thread with a Runnable lambda ----
        System.out.println("-- basic thread --");
        Thread thread = new Thread(() -> {
            for (int i = 1; i <= 3; i++) {
                System.out.println(Thread.currentThread().getName() + ": " + i);
            }
        });
        thread.start(); // starts a NEW thread — never call .run() directly for this purpose
        thread.join();  // wait here until 'thread' finishes before continuing
        System.out.println("Basic thread finished.");

        System.out.println("--------------------");

        // ---- start() vs run(): run() does NOT create a new thread ----
        System.out.println("-- calling run() directly (no new thread) --");
        Thread notReallyConcurrent = new Thread(() ->
            System.out.println("Running on: " + Thread.currentThread().getName())
        );
        notReallyConcurrent.run(); // just an ordinary method call on the CURRENT (main) thread
        System.out.println("(Notice: it printed the main thread's name, not a new one)");

        System.out.println("--------------------");

        // ---- unpredictable interleaving between threads ----
        System.out.println("-- two threads running concurrently --");
        Thread t1 = new Thread(() -> {
            for (int i = 1; i <= 3; i++) {
                System.out.println("Thread A: " + i);
            }
        });
        Thread t2 = new Thread(() -> {
            for (int i = 1; i <= 3; i++) {
                System.out.println("Thread B: " + i);
            }
        });
        t1.start();
        t2.start();
        t1.join(); // wait for both to finish before moving on
        t2.join();
        System.out.println("Both threads finished (exact interleaving above may vary between runs).");

        System.out.println("--------------------");

        // ---- sleep(): pausing the current thread ----
        System.out.println("-- sleep() --");
        System.out.println("Sleeping for 1 second...");
        Thread.sleep(1000); // pauses the CURRENT thread for 1000ms
        System.out.println("Done sleeping!");
    }
}