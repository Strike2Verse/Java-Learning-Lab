import java.util.Scanner;

public class TryCatchFinallyDemo {

    public static void main(String[] args) {

        // ---- basic try-catch ----
        System.out.println("-- basic try-catch --");
        try {
            int result = 10 / 0;
            System.out.println(result);
        } catch (ArithmeticException e) {
            System.out.println("Error: " + e.getMessage());
        }

        System.out.println("--------------------");

        // ---- multiple catch blocks (different handling per type) ----
        System.out.println("-- multiple catch blocks --");
        try {
            int[] arr = new int[5];
            arr[10] = 1; // ArrayIndexOutOfBoundsException
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Array error: " + e.getMessage());
        } catch (NullPointerException e) {
            System.out.println("Null error: " + e.getMessage());
        }

        System.out.println("--------------------");

        // ---- multi-catch: same handling for multiple exception types ----
        System.out.println("-- multi-catch with | --");
        try {
            String text = null;
            System.out.println(text.length()); // NullPointerException
        } catch (ArithmeticException | NullPointerException e) {
            System.out.println("Something went wrong: " + e.getClass().getSimpleName());
        }

        System.out.println("--------------------");

        // ---- finally: always runs ----
        System.out.println("-- finally with a caught exception --");
        try {
            System.out.println("Trying...");
            int result = 10 / 0;
        } catch (ArithmeticException e) {
            System.out.println("Caught it!");
        } finally {
            System.out.println("Always runs.");
        }

        System.out.println("--------------------");

        // ---- try-with-resources ----
        System.out.println("-- try-with-resources --");
        try (Scanner scanner = new Scanner("sample input")) {
            System.out.println("Read: " + scanner.next());
        } // scanner is automatically closed here, even if an exception occurs

        System.out.println("--------------------");

        // ---- throw: manually triggering an exception ----
        System.out.println("-- throw keyword --");
        try {
            checkAge(-5);
        } catch (IllegalArgumentException e) {
            System.out.println("Caught: " + e.getMessage());
        }
        checkAge(25); // valid, no exception thrown
    }

    // Manually throws an exception if the argument is invalid.
    // IllegalArgumentException is a common unchecked exception used
    // exactly for signaling that a method received a bad argument.
    static void checkAge(int age) {
        if (age < 0) {
            throw new IllegalArgumentException("Age cannot be negative");
        }
        System.out.println("Age is valid: " + age);
    }
}