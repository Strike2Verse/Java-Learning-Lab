import java.util.List;
import java.util.function.BiFunction;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Supplier;
import java.util.stream.Collectors;

public class LambdaFunctionalInterfacesDemo {
    public static void main(String[] args) {

        // ---- custom functional interface ----
        Greeting greeting = name -> System.out.println("Hello, " + name);
        greeting.greet("Alice");

        System.out.println("--------------------");

        // ---- Function<T, R> ----
        Function<Integer, Integer> square = x -> x * x;
        System.out.println("square.apply(5): " + square.apply(5));

        // ---- Predicate<T> ----
        Predicate<Integer> isEven = x -> x % 2 == 0;
        System.out.println("isEven.test(4): " + isEven.test(4));

        // ---- Consumer<T> ----
        Consumer<String> printer = s -> System.out.println("Got: " + s);
        printer.accept("hello");

        // ---- Supplier<T> ----
        Supplier<String> greetingSupplier = () -> "Hello there!";
        System.out.println("greetingSupplier.get(): " + greetingSupplier.get());

        // ---- BiFunction<T, U, R> ----
        BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;
        System.out.println("add.apply(3, 4): " + add.apply(3, 4));

        System.out.println("--------------------");

        // ---- combining functional interfaces ----
        Function<Integer, Integer> addOne = x -> x + 1;
        Function<Integer, Integer> combined = square.andThen(addOne); // square first, then add one
        System.out.println("combined.apply(3): " + combined.apply(3)); // 9, then +1 = 10

        Predicate<Integer> isPositive = x -> x > 0;
        Predicate<Integer> both = isEven.and(isPositive);
        System.out.println("both.test(4): " + both.test(4));   // true
        System.out.println("both.test(-4): " + both.test(-4)); // false

        System.out.println("--------------------");

        // ---- using these with Streams ----
        List<Integer> numbers = List.of(1, 2, 3, 4, 5, 6);
        List<Integer> evens = numbers.stream()
            .filter(isEven) // filter() literally expects a Predicate<T>
            .collect(Collectors.toList());
        System.out.println("Evens (via Predicate in filter): " + evens);

        System.out.println("--------------------");

        // ---- custom functional interface: Calculator ----
        Calculator addCalc = (a, b) -> a + b;
        Calculator multiplyCalc = (a, b) -> a * b;
        System.out.println("addCalc.calculate(3, 4): " + addCalc.calculate(3, 4));
        System.out.println("multiplyCalc.calculate(3, 4): " + multiplyCalc.calculate(3, 4));
    }
}