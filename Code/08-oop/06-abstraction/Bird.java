// Bird demonstrates working around Java's single-inheritance limit:
// it extends ONE class (Animal) but implements TWO interfaces
// (Flyable and Swimmable).
public class Bird extends Animal implements Flyable, Swimmable {
    public Bird(String name) {
        super(name);
    }

    @Override
    void makeSound() {
        System.out.println(name + " says Tweet!");
    }

    @Override
    public void fly() {
        System.out.println(name + " is flying!");
    }

    @Override
    public void swim() {
        System.out.println(name + " is paddling in the water!");
    }
}