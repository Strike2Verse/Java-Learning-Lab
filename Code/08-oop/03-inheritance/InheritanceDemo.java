public class InheritanceDemo {
    public static void main(String[] args) {

        // ---- a plain Car ----
        Car car = new Car("Toyota");
        car.accelerate();      // Toyota is now going 10 km/h
        car.displayInfo();

        System.out.println("--------------------");

        // ---- a SportsCar: inherits from Car, overrides accelerate() ----
        SportsCar sportsCar = new SportsCar("Ferrari");
        sportsCar.brand = "Ferrari";           // inherited field, works fine
        sportsCar.displayInfo();               // inherited method, works fine
        sportsCar.activateTurbo();             // SportsCar's own method

        // Calling accelerate() on a SportsCar runs the OVERRIDDEN version,
        // which internally calls super.accelerate() first, then adds more.
        sportsCar.accelerate();

        System.out.println("--------------------");

        // ---- comparing plain Car vs SportsCar accelerate() behavior ----
        Car plainCar = new Car("Honda");
        SportsCar anotherSportsCar = new SportsCar("Lamborghini");

        System.out.println("Plain car accelerating:");
        plainCar.accelerate(); // +10 only

        System.out.println("Sports car accelerating:");
        anotherSportsCar.accelerate(); // +10 (from super) then +10 more = +20 total
    }
}