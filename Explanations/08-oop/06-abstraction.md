# Abstraction (abstract classes and interfaces)

Abstraction means defining what something should do, without necessarily
specifying how — hiding complex implementation details and exposing only
the essential structure. Java provides two tools for this: abstract
classes and interfaces.

## Abstract classes

An abstract class cannot be instantiated directly — it's meant to be
extended. It can mix fully-implemented methods with methods that have no
body, forcing subclasses to provide their own implementation.

```java
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
```

```java
public class Dog extends Animal {
    public Dog(String name) {
        super(name);
    }

    @Override
    void makeSound() {
        System.out.println(name + " says Woof!");
    }
}
```

```java
Animal a = new Animal("Generic"); // COMPILE ERROR — cannot instantiate abstract class
Dog d = new Dog("Rex");            // fine — Dog provides makeSound()
```

## Interfaces

An interface is a pure contract — historically, only method signatures
(no bodies), which every implementing class must provide.

```java
public interface Flyable {
    void fly(); // no body — implicitly public and abstract
}
```

```java
public class Bird extends Animal implements Flyable {
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
}
```

## Why interfaces solve Java's single inheritance limitation

A class can only `extends` one parent class, but can `implements`
multiple interfaces:

```java
public class Bird extends Animal implements Flyable, Swimmable {
    // must implement fly() AND swim()
}
```

This works around Java not allowing multiple class inheritance. Multiple
class inheritance is disallowed specifically to avoid the **Diamond
Problem** — if two parent classes both defined a conflicting method with
different bodies, Java wouldn't know which one to inherit.

## Abstract class vs Interface — when to use which

| | Abstract Class | Interface |
|---|---|---|
| Instantiable? | No | No |
| Can have fields? | Yes | Only `public static final` constants |
| Can have constructors? | Yes | No |
| Can have method bodies? | Yes (mixed) | Yes, via `default` methods (Java 8+) |
| Multiple per class? | No (`extends` one only) | Yes (`implements` many) |

## default methods in interfaces (Java 8+)

Modern interfaces can provide a default implementation, which
implementing classes can use as-is or override:

```java
public interface Flyable {
    void fly();

    default void land() { // has a body — implementing classes get this for free
        System.out.println("Landing safely.");
    }
}
```

A regular interface method has no body (signature only, implicitly
abstract); a `default` method uses the `default` keyword and includes an
actual body.

## Practice Program

See:
- [`Animal.java`](../../Code/08-oop/06-abstraction/Animal.java) — abstract class
- [`Flyable.java`](../../Code/08-oop/06-abstraction/Flyable.java) — interface with a `default` method
- [`Swimmable.java`](../../Code/08-oop/06-abstraction/Swimmable.java) — plain interface
- [`Dog.java`](../../Code/08-oop/06-abstraction/Dog.java) — extends the abstract class
- [`Bird.java`](../../Code/08-oop/06-abstraction/Bird.java) — extends the abstract class AND implements two interfaces
- [`AbstractionDemo.java`](../../Code/08-oop/06-abstraction/AbstractionDemo.java) —
  a runnable example tying all of it together

### Compiling and running

```bash
cd Code/08-oop/06-abstraction
javac AbstractionDemo.java Animal.java Flyable.java Swimmable.java Dog.java Bird.java
java AbstractionDemo
```