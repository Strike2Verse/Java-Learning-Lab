public class SportsCar extends Car {

    boolean turboEnabled;

    public SportsCar(String brand) {
        super(brand);
        this.turboEnabled = false;
    }

    void activateTurbo() {
        turboEnabled = true;
        System.out.println(brand + "'s turbo activated!");
    }

    // overriding: same name, same parameters, resolved at runtime
    @Override
    void accelerate() {
        speed += 20; // sports cars accelerate faster
        System.out.println(brand + " zooms to " + speed + " km/h");
    }
}