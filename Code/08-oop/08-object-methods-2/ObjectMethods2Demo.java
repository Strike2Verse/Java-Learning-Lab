import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.TreeSet;

public class ObjectMethods2Demo {
    public static void main(String[] args) {

        // ---- Comparable: natural sort order (by speed) ----
        TreeSet<Car> cars = new TreeSet<>();
        cars.add(new Car("Toyota", 50));
        cars.add(new Car("Ferrari", 200));
        cars.add(new Car("Honda", 30));

        System.out.println("TreeSet (natural order, by speed): " + cars);

        System.out.println("--------------------");

        // ---- Comparator: alternate sort order (by brand) ----
        List<Car> carList = new ArrayList<>(cars);
        Comparator<Car> byBrand = (a, b) -> a.brand.compareTo(b.brand);
        carList.sort(byBrand);
        System.out.println("Sorted by brand (Comparator): " + carList);

        // ---- another Comparator: by brand length, then speed ----
        Comparator<Car> byBrandLengthThenSpeed = Comparator
            .comparingInt((Car c) -> c.brand.length())
            .thenComparingInt(c -> c.speed);
        carList.sort(byBrandLengthThenSpeed);
        System.out.println("Sorted by brand length, then speed: " + carList);

        // ---- sorting back to natural order (by speed) using Comparable ----
        carList.sort(null); // null means "use the class's own compareTo()"
        System.out.println("Sorted by natural order (speed) again: " + carList);

        System.out.println("--------------------");

        // ---- copy constructor: safer alternative to clone() ----
        Car original = new Car("Mazda", 80);
        Car copy = new Car(original); // creates an independent copy

        copy.speed = 999; // modifying the copy...
        System.out.println("Original: " + original); // ...does not affect the original
        System.out.println("Copy: " + copy);
    }
}