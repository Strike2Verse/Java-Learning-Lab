public class LoopControlStatements {
    public static void main(String[] args) {

        // ---- break ----
        // Immediately exits the loop entirely, even if the condition
        // was still true. No further iterations happen after this.
        System.out.println("-- break --");
        for (int i = 1; i <= 10; i++) {
            if (i == 5) {
                break; // stop the loop completely once i reaches 5
            }
            System.out.println(i);
        }
        // Output: 1 2 3 4  (stops before printing 5)

        System.out.println("--------------------");

        // ---- continue ----
        // Skips just the current iteration and moves to the next one.
        // The loop itself keeps running to completion.
        System.out.println("-- continue --");
        for (int i = 1; i <= 10; i++) {
            if (i % 2 == 0) {
                continue; // skip even numbers, keep looping
            }
            System.out.println(i);
        }
        // Output: 1 3 5 7 9  (even numbers skipped, loop still finishes)

        System.out.println("--------------------");

        // ---- break vs continue side by side ----
        // Same loop, same condition, different behavior.
        System.out.println("-- break vs continue on same condition --");

        System.out.println("Using break:");
        for (int i = 1; i <= 5; i++) {
            if (i == 3) {
                break;
            }
            System.out.println(i);
        }

        System.out.println("Using continue:");
        for (int i = 1; i <= 5; i++) {
            if (i == 3) {
                continue;
            }
            System.out.println(i);
        }
    }
}