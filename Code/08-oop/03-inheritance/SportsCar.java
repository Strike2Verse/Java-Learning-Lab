// SportsCar inherits brand, speed, and the methods below from Car,
// while adding its own field and behavior.
public class SportsCar extends Car {

    boolean turboEnabled;

    public SportsCar(String brand) {
        super(brand); // must be the first line — calls Car's constructor
        this.turboEnabled = false;
    }

    void activateTurbo() {
        turboEnabled = true;
        System.out.println("Turbo activated!");
    }

    // overrides Car's accelerate() with sports-car-specific behavior
    @Override
    void accelerate() {
        super.accelerate();          // runs Car's original accelerate() first
        speed += 10;                  // then adds extra speed on top
        System.out.println(brand + " zooms to " + speed + " km/h");
    }
}