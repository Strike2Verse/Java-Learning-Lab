import java.util.Arrays;
import java.util.function.Function;

public class LambdaExpressionsIntro {

    public static void main(String[] args) {

        // ---- Runnable: takes nothing, returns nothing ----
        // A lambda is a compact way to write a method without a name.
        Runnable task = () -> System.out.println("Running the task!");
        task.run();

        System.out.println("--------------------");

        // ---- Comparator: lambda with two parameters ----
        // Used here to sort an array in ascending order without writing
        // a full Comparator class.
        Integer[] nums = { 5, 2, 8, 1 };
        Arrays.sort(nums, (a, b) -> a - b);
        System.out.println("Sorted ascending: " + Arrays.toString(nums));

        // Descending order, just by flipping the subtraction.
        Arrays.sort(nums, (a, b) -> b - a);
        System.out.println("Sorted descending: " + Arrays.toString(nums));

        System.out.println("--------------------");

        // ---- Function: lambda that takes a value and returns a value ----
        // Single-expression body, so no { } or return keyword needed.
        Function<Integer, Integer> square = x -> x * x;
        System.out.println("square.apply(5) = " + square.apply(5));

        Function<Integer, Integer> cube = x -> x * x * x;
        System.out.println("cube.apply(3) = " + cube.apply(3));
    }
}