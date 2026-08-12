public class StringFormattingDemo {
    public static void main(String[] args) {

        // ---- String.format: inserting values into a template ----
        String name = "Alice";
        int age = 25;

        String message = String.format("Name: %s, Age: %d", name, age);
        System.out.println(message);

        System.out.println("--------------------");

        // ---- controlling decimal places ----
        double price = 19.567;
        System.out.println(String.format("Price: $%.2f", price)); // rounds to 19.57

        System.out.println("--------------------");

        // ---- padding and width ----
        System.out.println(String.format("[%10s]", "hi"));  // right-aligned, width 10
        System.out.println(String.format("[%-10s]", "hi")); // left-aligned, width 10

        System.out.println("--------------------");

        // ---- other common specifiers ----
        char grade = 'A';
        boolean passed = true;
        System.out.println(String.format("Grade: %c, Passed: %b", grade, passed));

        System.out.println("--------------------");

        // ---- printf: same idea, prints directly ----
        System.out.printf("Name: %s, Age: %d%n", name, age);

        System.out.println("--------------------");

        // ---- text blocks: multi-line strings made easy ----
        String oldWay = "Line 1\n" +
                        "Line 2\n" +
                        "Line 3";
        System.out.println("Old way:");
        System.out.println(oldWay);

        String textBlock = """
                Line 1
                Line 2
                Line 3
                """;
        System.out.println("Text block:");
        System.out.println(textBlock);
    }
}