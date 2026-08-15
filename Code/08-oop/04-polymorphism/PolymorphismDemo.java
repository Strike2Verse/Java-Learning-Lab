public class PolymorphismDemo {
    public static void main(String[] args) {

        // ---- runtime polymorphism: parent-type reference, child object ----
        Car myCar = new SportsCar("Ferrari"); // reference type Car, actual object SportsCar
        myCar.accelerate(); // runs SportsCar's overridden version, not Car's

        System.out.println("--------------------");

        // ---- treating different objects uniformly via an array ----
        Car[] cars = {
            new Car("Honda"),
            new SportsCar("Ferrari"),
            new SportsCar("Lamborghini")
        };

        for (Car car : cars) {
            car.accelerate(); // each one runs its OWN version automatically
        }

        System.out.println("--------------------");

        // ---- polymorphism with method parameters ----
        testDrive(new Car("Toyota"));         // works
        testDrive(new SportsCar("Mazda"));    // also works — SportsCar IS-A Car

        System.out.println("--------------------");

        // ---- instanceof: checking the actual type at runtime ----
        Car unknownCar = new SportsCar("Bugatti");

        // modern pattern: check and cast in one line (Java 16+)
        if (unknownCar instanceof SportsCar sc) {
            sc.activateTurbo(); // "sc" is already cast and ready to use here
        }

        Car plainCar = new Car("Nissan");
        if (plainCar instanceof SportsCar sc2) {
            sc2.activateTurbo(); // this branch does NOT run — plainCar is not a SportsCar
        } else {
            System.out.println(plainCar.brand + " has no turbo to activate.");
        }
    }

    // accepts ANY Car or subclass of Car
    static void testDrive(Car car) {
        System.out.println("Test driving: " + car.brand);
        car.accelerate();
    }
}