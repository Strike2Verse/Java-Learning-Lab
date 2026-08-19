import java.util.List;

public class GenericsDemo {
    public static void main(String[] args) {

        // ---- generic class: Box<T> ----
        Box<String> stringBox = new Box<>();
        stringBox.set("hello");
        String s = stringBox.get(); // no cast needed
        System.out.println("stringBox: " + s);

        Box<Integer> intBox = new Box<>();
        intBox.set(42);
        System.out.println("intBox: " + intBox.get());
        // intBox.set("oops"); // COMPILE ERROR — caught immediately, not at runtime

        System.out.println("--------------------");

        // ---- generic method ----
        List<String> names = List.of("Alice", "Bob");
        String first = firstElement(names); // T inferred as String automatically
        System.out.println("First element: " + first);

        System.out.println("--------------------");

        // ---- multiple type parameters: Pair<K, V> ----
        Pair<String, Integer> entry = new Pair<>("age", 25);
        System.out.println("Pair: " + entry);
        System.out.println("Key: " + entry.getKey() + ", Value: " + entry.getValue());

        System.out.println("--------------------");

        // ---- bounded type parameter: NumberBox<T extends Number> ----
        NumberBox<Integer> numberBox = new NumberBox<>(5);
        System.out.println("Doubled: " + numberBox.doubled());
        // NumberBox<String> invalid = new NumberBox<>("hi"); // COMPILE ERROR

        System.out.println("--------------------");

        // ---- wildcard: List<? extends Number> ----
        List<Integer> ints = List.of(1, 2, 3);
        List<Double> doubles = List.of(1.5, 2.5);
        System.out.println("Sum of ints: " + sumAll(ints));
        System.out.println("Sum of doubles: " + sumAll(doubles));
    }

    // Generic method — independent of any specific class.
    static <T> T firstElement(List<T> list) {
        return list.get(0);
    }

    // Wildcard parameter — accepts List<Integer>, List<Double>, etc.
    static double sumAll(List<? extends Number> numbers) {
        double total = 0;
        for (Number n : numbers) {
            total += n.doubleValue();
        }
        return total;
    }
}