import java.util.ArrayList;

public class ArrayListDemo {
    public static void main(String[] args) {

        // ---- creating an ArrayList of Strings ----
        ArrayList<String> fruits = new ArrayList<>();

        // ---- adding elements ----
        fruits.add("Apple");
        fruits.add("Banana");
        fruits.add("Cherry");
        System.out.println("After adding: " + fruits);

        // ---- accessing an element ----
        System.out.println("First fruit: " + fruits.get(0));

        // ---- modifying an element ----
        fruits.set(1, "Blueberry"); // replaces "Banana"
        System.out.println("After set(1, Blueberry): " + fruits);

        // ---- removing elements ----
        fruits.remove("Cherry"); // remove by value
        System.out.println("After removing Cherry: " + fruits);

        fruits.remove(0); // remove by index (removes "Apple")
        System.out.println("After removing index 0: " + fruits);

        // ---- size ----
        // size() is a method, unlike an array's .length field.
        System.out.println("Size: " + fruits.size());

        // ---- looping ----
        System.out.println("Looping through fruits:");
        for (String fruit : fruits) {
            System.out.println(fruit);
        }

        // ---- checking if something exists ----
        System.out.println("Contains Blueberry? " + fruits.contains("Blueberry"));
        System.out.println("Contains Apple? " + fruits.contains("Apple"));

        System.out.println("--------------------");

        // ---- ArrayList with primitives (via wrapper class) ----
        // Generics only work with objects, not primitives, so int
        // becomes Integer here. Java converts automatically between
        // int and Integer behind the scenes (autoboxing/unboxing).
        ArrayList<Integer> numbers = new ArrayList<>();
        numbers.add(10);
        numbers.add(20);
        numbers.add(30);

        int total = 0;
        for (int num : numbers) { // unboxing happens here automatically
            total += num;
        }
        System.out.println("Numbers: " + numbers);
        System.out.println("Total: " + total);
    }
}