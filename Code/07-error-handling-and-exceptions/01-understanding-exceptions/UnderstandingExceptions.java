import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class UnderstandingExceptions {

    public static void main(String[] args) {

        // ---- checked exception: must be handled or declared ----
        // IOException is checked, so this call MUST be wrapped in
        // try-catch (or the method must declare "throws IOException").
        System.out.println("-- checked exception (IOException) --");
        try {
            readFile();
        } catch (IOException e) {
            System.out.println("Caught checked exception: " + e.getMessage());
        }

        System.out.println("--------------------");

        // ---- unchecked exception: handling is optional, compiles either way ----
        System.out.println("-- unchecked exception (ArrayIndexOutOfBoundsException) --");
        try {
            int[] arr = new int[5];
            System.out.println(arr[10]); // this line would crash if not caught
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("Caught unchecked exception: " + e.getMessage());
        }

        System.out.println("--------------------");

        // ---- other common unchecked exceptions ----
        System.out.println("-- NullPointerException --");
        try {
            String text = null;
            System.out.println(text.length()); // NullPointerException
        } catch (NullPointerException e) {
            System.out.println("Caught: NullPointerException");
        }

        System.out.println("-- ArithmeticException --");
        try {
            int result = 10 / 0; // ArithmeticException — divide by zero
            System.out.println(result);
        } catch (ArithmeticException e) {
            System.out.println("Caught: " + e.getMessage());
        }

        System.out.println("-- NumberFormatException --");
        try {
            int number = Integer.parseInt("abc"); // not a valid number
            System.out.println(number);
        } catch (NumberFormatException e) {
            System.out.println("Caught: " + e.getMessage());
        }
    }

    // This method reads a missing file, which will throw IOException.
    // Since IOException is checked, the method MUST declare "throws IOException"
    // (or handle it internally with a try-catch).
    static void readFile() throws IOException {
        Files.readString(Path.of("missing.txt"));
    }
}