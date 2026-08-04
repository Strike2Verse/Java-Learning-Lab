public class Loops {
    public static void main(String[] args) {

        // ---- regular for loop ----
        // Best when we know exactly how many times to repeat.
        System.out.println("-- for loop --");
        for (int i = 1; i <= 5; i++) {
            System.out.println("Count: " + i);
        }

        System.out.println("--------------------");

        // ---- while loop ----
        // Condition is checked BEFORE each run.
        // If the condition is false from the start, the body never runs.
        System.out.println("-- while loop --");
        int count = 1;
        while (count <= 5) {
            System.out.println("Count: " + count);
            count++;
        }

        System.out.println("--------------------");

        // ---- do-while loop ----
        // Condition is checked AFTER each run, so the body always runs
        // at least once, even if the condition starts out false.
        System.out.println("-- do-while loop --");
        int num = 1;
        do {
            System.out.println("Count: " + num);
            num++;
        } while (num <= 5);

        System.out.println("--------------------");

        // ---- enhanced for loop (for-each) ----
        // Used to go through every element in an array/collection
        // without needing to manage an index manually.
        System.out.println("-- enhanced for loop --");
        int[] numbers = {10, 20, 30, 40};
        for (int value : numbers) {
            System.out.println(value);
        }

        System.out.println("--------------------");

        // ---- regular for loop with index (comparison example) ----
        // Shown here for contrast: gives access to the index,
        // which the enhanced for loop above does not provide.
        System.out.println("-- for loop with index --");
        for (int i = 0; i < numbers.length; i++) {
            System.out.println("Index " + i + ": " + numbers[i]);
        }
    }
}