public abstract class Animal {

    String name;

    public Animal(String name) {
        this.name = name;
    }

    // abstract method — no body, subclasses MUST implement this
    abstract void makeSound();

    // regular method — shared by all subclasses as-is
    void sleep() {
        System.out.println(name + " is sleeping.");
    }
}