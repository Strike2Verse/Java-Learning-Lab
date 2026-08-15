public class Car implements Comparable<Car> {
    String brand;
    int speed;

    public Car(String brand, int speed) {
        this.brand = brand;
        this.speed = speed;
    }

    // copy constructor — a safer, clearer alternative to clone().
    // Avoids casting from Object, CloneNotSupportedException, issues
    // with final fields, and the flawed Cloneable mechanism.
    public Car(Car other) {
        this.brand = other.brand;
        this.speed = other.speed;
    }

    // Comparable: defines the ONE "natural" sort order for this class —
    // sorted by speed, ascending.
    @Override
    public int compareTo(Car other) {
        return Integer.compare(this.speed, other.speed);
    }

    @Override
    public String toString() {
        return brand + " (" + speed + " km/h)";
    }
}