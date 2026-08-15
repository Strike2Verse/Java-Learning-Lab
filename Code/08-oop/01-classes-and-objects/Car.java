public class Car {

    // fields (also called instance variables) — describe the object's state
    String brand;
    String color;
    int speed;

    // method — describes the object's behavior
    void accelerate() {
        this.speed += 10; // "this" refers to the object accelerate() was called on
        System.out.println(brand + " is now going " + speed + " km/h");
    }

    // a second method, showing "this" is optional when there's no ambiguity
    void displayInfo() {
        System.out.println(brand + " (" + color + ") - current speed: " + speed + " km/h");
    }
}