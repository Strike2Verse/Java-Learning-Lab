public class StringMethods {
    public static void main(String[] args) {

        String text = "Hello World";

        // ---- length ----
        System.out.println("Length: " + text.length());

        // ---- case conversion ----
        System.out.println("Upper: " + text.toUpperCase());
        System.out.println("Lower: " + text.toLowerCase());

        System.out.println("--------------------");

        // ---- trimming whitespace ----
        String padded = "   Hello   ";
        System.out.println("Trimmed: [" + padded.trim() + "]");

        System.out.println("--------------------");

        // ---- substring ----
        // end index is exclusive: substring(0, 5) gives indexes 0-4
        System.out.println("substring(6): " + text.substring(6));
        System.out.println("substring(0, 5): " + text.substring(0, 5));

        System.out.println("--------------------");

        // ---- searching within a string ----
        System.out.println("indexOf(World): " + text.indexOf("World"));
        System.out.println("contains(Hello): " + text.contains("Hello"));
        System.out.println("startsWith(Hello): " + text.startsWith("Hello"));
        System.out.println("endsWith(World): " + text.endsWith("World"));

        System.out.println("--------------------");

        // ---- replacing ----
        // returns a new String — does not modify the original 'text'
        String replaced = text.replace("World", "Java");
        System.out.println("Original text: " + text);
        System.out.println("After replace(): " + replaced);

        System.out.println("--------------------");

        // ---- splitting ----
        String csv = "apple,banana,cherry";
        String[] fruits = csv.split(",");
        System.out.println("Split result:");
        for (String fruit : fruits) {
            System.out.println(fruit);
        }

        System.out.println("--------------------");

        // ---- checking if empty/blank ----
        String empty = "";
        String spaces = "   ";
        System.out.println("empty.isEmpty(): " + empty.isEmpty());   // true
        System.out.println("empty.isBlank(): " + empty.isBlank());   // true
        System.out.println("spaces.isEmpty(): " + spaces.isEmpty()); // false — has characters
        System.out.println("spaces.isBlank(): " + spaces.isBlank()); // true — no visible content

        System.out.println("--------------------");

        // ---- getting a single character ----
        System.out.println("charAt(0): " + text.charAt(0));
    }
}