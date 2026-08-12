public class StringOperations {
    public static void main(String[] args) {

        // ---- creating strings ----
        String name1 = "Alice";           // string literal (goes into the string pool)
        String name2 = new String("Bob"); // explicit object (rarely used, but good to know)
        System.out.println(name1 + " " + name2);

        System.out.println("--------------------");

        // ---- concatenation ----
        String first = "John";
        String last = "Doe";

        String full1 = first + " " + last;             // using +
        String full2 = first.concat(" ").concat(last);  // using .concat()

        System.out.println("Using +: " + full1);
        System.out.println("Using concat(): " + full2);

        System.out.println("--------------------");

        // ---- comparing strings: == vs .equals() ----
        String a = "hello";
        String b = "hello";
        String c = new String("hello");

        // a and b are the same literal, so they share the same object
        // in the string pool -> == is true here.
        System.out.println("a == b: " + (a == b));

        // c was created with 'new', forcing a separate object in memory,
        // even though the text is identical -> == is false.
        System.out.println("a == c: " + (a == c));

        // .equals() compares actual text content, not memory location.
        // This is the safe, correct way to compare String content.
        System.out.println("a.equals(c): " + a.equals(c));

        System.out.println("--------------------");

        // ---- immutability: concat() does not change the original ----
        String s = "Hello";
        s.concat(" World"); // creates a new String, but result is discarded
        System.out.println("After s.concat(\" World\") (no reassignment): " + s); // still "Hello"

        s = s.concat(" World"); // reassigns s to point at the new String
        System.out.println("After s = s.concat(\" World\"): " + s); // now "Hello World"
    }
}