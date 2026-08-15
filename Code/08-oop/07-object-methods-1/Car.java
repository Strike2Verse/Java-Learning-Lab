import java.util.Objects;

public class Car {
    String brand;
    int speed;

    public Car(String brand, int speed) {
        this.brand = brand;
        this.speed = speed;
    }

    // controls how the object prints — without this, println would show
    // something like Car@1b6d3586 (class name + memory hash)
    @Override
    public String toString() {
        return brand + " going " + speed + " km/h";
    }

    // compares by field values instead of the default reference (==) check
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;               // same object reference
        if (obj == null || getClass() != obj.getClass()) return false; // null or different type
        Car other = (Car) obj;                       // safe to cast now
        return speed == other.speed && brand.equals(other.brand);
    }

    // MUST be overridden alongside equals() — HashSet/HashMap rely on
    // hashCode() to decide which "bucket" an object belongs in.
    @Override
    public int hashCode() {
        return Objects.hash(brand, speed); // combines fields into one hash
    }
}