import java.util.HashSet;

public class ObjectMethods1Demo {
    public static void main(String[] args) {

        // ---- toString() ----
        Car car = new Car("Toyota", 50);
        System.out.println("Printed directly: " + car); // uses overridden toString()

        System.out.println("--------------------");

        // ---- equals() ----
        Car car1 = new Car("Toyota", 50);
        Car car2 = new Car("Toyota", 50);
        Car car3 = new Car("Honda", 40);

        System.out.println("car1.equals(car2): " + car1.equals(car2)); // true — same field values
        System.out.println("car1.equals(car3): " + car1.equals(car3)); // false — different values
        System.out.println("car1 == car2: " + (car1 == car2));          // false — different objects in memory

        System.out.println("--------------------");

        // ---- hashCode() ----
        System.out.println("car1.hashCode(): " + car1.hashCode());
        System.out.println("car2.hashCode(): " + car2.hashCode());
        // "Equal" objects (per equals()) must produce the same hashCode
        System.out.println("Same hashCode? " + (car1.hashCode() == car2.hashCode()));

        System.out.println("--------------------");

        // ---- why this matters: HashSet duplicate detection ----
        HashSet<Car> cars = new HashSet<>();
        cars.add(new Car("Toyota", 50));
        cars.add(new Car("Toyota", 50)); // "duplicate" by value
        cars.add(new Car("Honda", 40));  // genuinely different

        System.out.println("HashSet size: " + cars.size()); // 2, not 3 — duplicate correctly rejected
        System.out.println("Contains Toyota/50? " + cars.contains(new Car("Toyota", 50)));
    }
}