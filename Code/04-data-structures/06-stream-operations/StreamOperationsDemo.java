import java.util.List;
import java.util.stream.Collectors;

public class StreamOperationsDemo {
    public static void main(String[] args) {

        List<Integer> numbers = List.of(1, 2, 3, 4, 5, 6);
        System.out.println("Original: " + numbers);

        // ---- filter: keep only elements matching a condition ----
        List<Integer> evens = numbers.stream()
            .filter(n -> n % 2 == 0)
            .collect(Collectors.toList());
        System.out.println("Evens (filter): " + evens);

        // ---- map: transform each element ----
        List<Integer> squared = numbers.stream()
            .map(n -> n * n)
            .collect(Collectors.toList());
        System.out.println("Squared (map): " + squared);

        System.out.println("--------------------");

        // ---- chaining filter + map ----
        List<Integer> evensSquared = numbers.stream()
            .filter(n -> n % 2 == 0)  // keep evens: 2, 4, 6
            .map(n -> n * n)           // square them: 4, 16, 36
            .collect(Collectors.toList());
        System.out.println("Evens then squared: " + evensSquared);

        System.out.println("--------------------");

        // ---- order matters: same result here, since squaring an ----
        // ---- even number is still even ----
        List<Integer> squaredThenEvens = numbers.stream()
            .map(n -> n * n)           // square everything: 1,4,9,16,25,36
            .filter(n -> n % 2 == 0)   // keep evens: 4, 16, 36
            .collect(Collectors.toList());
        System.out.println("Squared then evens (same result here): " + squaredThenEvens);

        // ---- order matters: DIFFERENT result here ----
        List<Integer> filterThenSubtract = numbers.stream()
            .filter(n -> n > 3)  // keep > 3: 4, 5, 6
            .map(n -> n - 3)      // subtract 3: 1, 2, 3
            .collect(Collectors.toList());
        System.out.println("filter(>3) then map(-3): " + filterThenSubtract);

        List<Integer> subtractThenFilter = numbers.stream()
            .map(n -> n - 3)      // subtract 3 from everything: -2,-1,0,1,2,3
            .filter(n -> n > 3)   // keep > 3: nothing matches!
            .collect(Collectors.toList());
        System.out.println("map(-3) then filter(>3): " + subtractThenFilter);

        System.out.println("--------------------");

        // ---- other common terminal operations ----
        long countAboveThree = numbers.stream()
            .filter(n -> n > 3)
            .count();
        System.out.println("Count of numbers > 3: " + countAboveThree);

        boolean anyMatchAboveFive = numbers.stream()
            .anyMatch(n -> n > 5);
        System.out.println("Any number > 5? " + anyMatchAboveFive);
    }
}