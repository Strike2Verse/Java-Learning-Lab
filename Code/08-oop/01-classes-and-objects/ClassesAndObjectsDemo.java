public class ClassesAndObjectsDemo {
    public static void main(String[] args) {

        // ---- creating two separate objects from the same class ----
        Car car1 = new Car();
        car1.brand = "Toyota";
        car1.color = "Red";
        car1.speed = 0;

        Car car2 = new Car();
        car2.brand = "Honda";
        car2.color = "Blue";
        car2.speed = 0;

        // ---- each object has its own independent fields ----
        car1.accelerate(); // Toyota is now going 10 km/h
        car2.accelerate(); // Honda is now going 10 km/h
        car1.accelerate(); // Toyota is now going 20 km/h

        System.out.println("--------------------");

        // Changing car1's color does not affect car2 at all.
        car1.color = "Black";
        car1.displayInfo(); // Toyota (Black) - speed 20
        car2.displayInfo(); // Honda (Blue) - speed 10

        System.out.println("--------------------");

        // ---- calling a non-static method requires an object ----
        // accelerate(); // this line would NOT compile — no object to call it on
        Car car3 = new Car();
        car3.brand = "Mazda";
        car3.color = "White";
        car3.speed = 0;
        car3.accelerate(); // works fine, called on the car3 object
    }
}