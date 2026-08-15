public class ConstructorsDemo {
    public static void main(String[] args) {

        // ---- overloaded constructors ----
        Car car1 = new Car("Toyota", "Red");        // uses 2-param constructor (chains to 3-param)
        Car car2 = new Car("Honda", "Blue", 50);    // uses 3-param constructor directly

        car1.displayInfo(); // Toyota (Red) - speed 0
        car2.displayInfo(); // Honda (Blue) - speed 50

        System.out.println("--------------------");

        // ---- fields are set immediately via the constructor ----
        // no need to manually assign brand/color/speed one by one
        car1.accelerate(); // Toyota is now going 10 km/h
        car2.accelerate(); // Honda is now going 60 km/h

        System.out.println("--------------------");

        // ---- each object is still fully independent ----
        Car car3 = new Car("Mazda", "White");
        car3.displayInfo(); // Mazda (White) - speed 0

        car1.displayInfo();
        car2.displayInfo();
        car3.displayInfo();
    }
}