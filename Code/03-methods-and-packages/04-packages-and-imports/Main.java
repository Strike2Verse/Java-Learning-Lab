// This file has no package statement, so it sits in the "default package".
// A default-package class CAN import classes from named packages (like
// com.javalab.utils below) — it is the reverse that is not allowed:
// named-package classes cannot import from the default package.

import com.javalab.utils.MathHelper;

// Built-in package imports — java.util is part of Java's own library.
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {

        // Using a class imported from our own custom package.
        System.out.println("square(5) = " + MathHelper.square(5));
        System.out.println("cube(3) = " + MathHelper.cube(3));

        System.out.println("--------------------");

        // Using a class imported from a built-in package (java.util).
        int[] numbers = { 4, 1, 3, 2 };
        Arrays.sort(numbers);
        System.out.println("Sorted: " + Arrays.toString(numbers));
    }
}