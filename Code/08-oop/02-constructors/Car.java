public class Car {

    String brand;
    String color;
    int speed;

    // 2-parameter constructor — chains to the 3-parameter one below,
    // avoiding duplicated initialization logic.
    public Car(String brand, String color) {
        this(brand, color, 0); // calls the 3-parameter constructor with speed=0
    }

    // 3-parameter constructor — the "real" initializer.
    public Car(String brand, String color, int speed) {
        // "this.brand" = the field, "brand" = the parameter (shadowing).
        // Without "this", brand = brand would just assign the parameter
        // to itself, leaving the field null.
        this.brand = brand;
        this.color = color;
        this.speed = speed;
    }

    void accelerate() {
        this.speed += 10;
        System.out.println(brand + " is now going " + speed + " km/h");
    }

    void displayInfo() {
        System.out.println(brand + " (" + color + ") - current speed: " + speed + " km/h");
    }
}