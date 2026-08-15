public class Car {

    String brand;
    int speed;

    public Car(String brand) {
        this.brand = brand;
        this.speed = 0;
    }

    void accelerate() {
        speed += 10;
        System.out.println(brand + " is now going " + speed + " km/h");
    }
}