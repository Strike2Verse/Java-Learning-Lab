import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class RegularExpressionsDemo {
    public static void main(String[] args) {

        // ---- basic pattern matching with String.matches() ----
        // matches() requires the ENTIRE string to fit the pattern.
        String text = "Hello123World456";
        System.out.println("matches [a-zA-Z0-9]+: " + text.matches("[a-zA-Z0-9]+"));

        System.out.println("--------------------");

        // ---- Pattern and Matcher: finding all occurrences ----
        // find() scans for the pattern anywhere in the string, one
        // match at a time — used in a loop to catch every occurrence.
        String numbersText = "My numbers are 42 and 108";
        Pattern pattern = Pattern.compile("\\d+"); // \\d because \ needs escaping in a Java string
        Matcher matcher = pattern.matcher(numbersText);

        System.out.println("Numbers found:");
        while (matcher.find()) {
            System.out.println(matcher.group());
        }

        System.out.println("--------------------");

        // ---- replacing using regex ----
        String messy = "Hello    World";
        String clean = messy.replaceAll("\\s+", " "); // collapse multiple spaces into one
        System.out.println("Original: [" + messy + "]");
        System.out.println("Cleaned:  [" + clean + "]");

        System.out.println("--------------------");

        // ---- validating a basic email pattern ----
        // Simplified pattern for learning purposes only —
        // real-world email validation is more complex.
        String validEmail = "test@example.com";
        String invalidEmail = "not-an-email";
        String emailPattern = "^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$";

        System.out.println(validEmail + " valid? " + validEmail.matches(emailPattern));
        System.out.println(invalidEmail + " valid? " + invalidEmail.matches(emailPattern));

        System.out.println("--------------------");

        // ---- splitting with regex ----
        String data = "apple, banana,  cherry";
        String[] items = data.split(",\\s*"); // split on comma, followed by zero or more spaces
        System.out.println("Split result:");
        for (String item : items) {
            System.out.println(item);
        }
    }
}