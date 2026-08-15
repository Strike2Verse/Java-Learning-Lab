public class AbstractionDemo {
    public static void main(String[] args) {

        // Animal a = new Animal("Generic"); // COMPILE ERROR — cannot instantiate abstract class

        // ---- abstract class: each subclass provides its own makeSound() ----
        Dog dog = new Dog("Rex");
        dog.makeSound(); // Rex says Woof!
        dog.sleep();     // Rex is sleeping. (inherited, unchanged)

        System.out.println("--------------------");

        // ---- a class implementing multiple interfaces ----
        Bird bird = new Bird("Tweety");
        bird.makeSound(); // Tweety says Tweet!
        bird.fly();        // Tweety is flying!
        bird.swim();        // Tweety is paddling in the water!

        // default method — Bird gets this for free from Flyable
        bird.land();

        System.out.println("--------------------");

        // ---- polymorphism still applies through the interfaces ----
        Flyable flyingThing = bird;
        flyingThing.fly();
        flyingThing.land(); // still works — default method

        Swimmable swimmingThing = bird;
        swimmingThing.swim();

        System.out.println("--------------------");

        // ---- Animal reference can hold any concrete subclass ----
        Animal[] animals = { dog, bird };
        for (Animal a : animals) {
            a.makeSound(); // each runs its own overridden version
            a.sleep();      // shared behavior from the abstract class
        }
    }
}