import java.util.Scanner;

public class InputOutput {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in); // Creates an object to read keyboard input.

        System.out.print("Enter text: "); // Shows a prompt without moving to a new line.
        String text = input.nextLine(); // Reads a full line of text.

        System.out.print("Enter a whole number: "); // Asks for a whole number.
        int number = input.nextInt(); // Reads the entered whole number.

        System.out.println("Text: " + text); // Prints the entered text.
        System.out.println("Number: " + number); // Prints the entered number.

        input.close(); // Releases the scanner after it is no longer needed.
    }
}
