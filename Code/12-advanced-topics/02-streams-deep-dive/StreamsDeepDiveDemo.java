import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class StreamsDeepDiveDemo {
    public static void main(String[] args) {

        List<Integer> numbers = List.of(1, 2, 3, 4, 5);
        List<String> names = List.of("Charlie", "Alice", "Bob");

        // ---- reduce: combining all elements into a single result ----
        int sum = numbers.stream().reduce(0, (a, b) -> a + b);
        int product = numbers.stream().reduce(1, (a, b) -> a * b);
        System.out.println("Sum (reduce): " + sum);       // 15
        System.out.println("Product (reduce): " + product); // 120

        System.out.println("--------------------");

        // ---- sorted: natural order and custom Comparator ----
        List<String> sorted = names.stream()
            .sorted()
            .collect(Collectors.toList());
        System.out.println("Sorted (natural order): " + sorted);

        List<String> sortedByLength = names.stream()
            .sorted(Comparator.comparingInt(String::length))
            .collect(Collectors.toList());
        System.out.println("Sorted by length: " + sortedByLength);

        System.out.println("--------------------");

        // ---- distinct: removing duplicates ----
        List<Integer> withDupes = List.of(1, 2, 2, 3, 3, 3);
        List<Integer> unique = withDupes.stream()
            .distinct()
            .collect(Collectors.toList());
        System.out.println("Distinct: " + unique); // [1, 2, 3]

        System.out.println("--------------------");

        // ---- limit and skip ----
        List<Integer> firstThree = numbers.stream().limit(3).collect(Collectors.toList());
        List<Integer> afterTwo = numbers.stream().skip(2).collect(Collectors.toList());
        System.out.println("First three (limit): " + firstThree);
        System.out.println("After two (skip): " + afterTwo);

        System.out.println("--------------------");

        // ---- Collectors beyond toList() ----
        String joined = names.stream().collect(Collectors.joining(", "));
        System.out.println("Joined: " + joined);

        Map<Integer, List<String>> groupedByLength = names.stream()
            .collect(Collectors.groupingBy(String::length));
        System.out.println("Grouped by length: " + groupedByLength);

        double average = numbers.stream()
            .collect(Collectors.averagingInt(Integer::intValue));
        System.out.println("Average: " + average);

        System.out.println("--------------------");

        // ---- method references (shorthand for simple lambdas) ----
        List<String> upper = names.stream()
            .map(String::toUpperCase) // same as .map(s -> s.toUpperCase())
            .collect(Collectors.toList());
        System.out.println("Uppercased (method reference): " + upper);

        System.out.println("--------------------");

        // ---- streams are lazy: nothing runs until a terminal operation ----
        System.out.println("Building the stream (no filtering has happened yet)...");
        Stream<String> stream = names.stream()
            .filter(name -> {
                System.out.println("Filtering: " + name); // won't print until collect() runs
                return name.length() > 3;
            });

        System.out.println("Now calling collect() — filtering happens now:");
        List<String> result = stream.collect(Collectors.toList());
        System.out.println("Result: " + result);
    }
}