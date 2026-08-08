public class Arrays1DAnd2D {
    public static void main(String[] args) {

        // ---- 1D array: creating with a fixed size ----
        // All slots default to 0 for int arrays.
        int[] scores = new int[5];
        System.out.println("Default scores: ");
        for (int i = 0; i < scores.length; i++) {
            System.out.println(scores[i]);
        }

        System.out.println("--------------------");

        // ---- 1D array: creating with values directly ----
        int[] numbers = { 10, 20, 30, 40, 50 };

        // Accessing elements — index starts at 0.
        System.out.println("First element: " + numbers[0]);
        System.out.println("Last element: " + numbers[numbers.length - 1]);

        // Modifying an element.
        numbers[2] = 99;
        System.out.println("After modifying index 2:");
        for (int i = 0; i < numbers.length; i++) {
            System.out.println(numbers[i]);
        }

        System.out.println("--------------------");

        // ---- 2D array: grid of values ----
        int[][] grid = {
            { 1, 2, 3 },
            { 4, 5, 6 },
            { 7, 8, 9 }
        };

        // Accessing a single element: [row][column]
        System.out.println("grid[1][2] = " + grid[1][2]); // 6

        // Looping through a 2D array needs a nested loop:
        // outer loop = rows, inner loop = columns within that row.
        System.out.println("Full grid:");
        for (int row = 0; row < grid.length; row++) {
            for (int col = 0; col < grid[row].length; col++) {
                System.out.print(grid[row][col] + " ");
            }
            System.out.println(); // move to next line after each row
        }
    }
}