import java.util.HashSet;
import java.util.TreeSet;

public class HashSetTreeSetDemo {
    public static void main(String[] args) {

        // ---- HashSet: unique values, no guaranteed order ----
        HashSet<String> names = new HashSet<>();
        names.add("Alice");
        names.add("Bob");
        names.add("Alice"); // ignored — already exists, set stays unchanged

        System.out.println("HashSet: " + names);
        System.out.println("Size: " + names.size()); // 2, not 3

        System.out.println("Contains Bob? " + names.contains("Bob"));
        names.remove("Bob");
        System.out.println("After removing Bob: " + names);

        System.out.println("Looping through HashSet:");
        for (String name : names) {
            System.out.println(name);
        }

        System.out.println("--------------------");

        // ---- TreeSet: unique values, automatically sorted ----
        TreeSet<Integer> numbers = new TreeSet<>();
        numbers.add(50);
        numbers.add(10);
        numbers.add(30);
        numbers.add(10); // ignored — duplicate

        System.out.println("TreeSet (always sorted): " + numbers);

        // TreeSet-specific methods
        System.out.println("Smallest (first): " + numbers.first());
        System.out.println("Largest (last): " + numbers.last());

        System.out.println("Looping through TreeSet:");
        for (int num : numbers) {
            System.out.println(num);
        }
    }
}