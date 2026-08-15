# Classes and Objects

The foundation of OOP — arguably the most important concept in Java.

## What a class is

A class is a blueprint — it defines what properties (fields) and
behaviors (methods) something will have, but it isn't a real thing
itself.

## What an object is

An object is an actual instance created from a class — the real "thing"
built using the blueprint. Many different objects can be created from the
same class, each with its own separate data.

## Defining a class with fields and methods

```java
public class Car {
    // fields (also called instance variables) — describe the object's state
    String brand;
    String color;
    int speed;

    // method — describes the object's behavior
    void accelerate() {
        speed += 10;
        System.out.println(brand + " is now going " + speed + " km/h");
    }
}
```

## Creating objects from a class

```java
Car car1 = new Car();
car1.brand = "Toyota";
car1.color = "Red";
car1.speed = 0;

Car car2 = new Car();
car2.brand = "Honda";
car2.color = "Blue";
car2.speed = 0;

car1.accelerate(); // Toyota is now going 10 km/h
car2.accelerate(); // Honda is now going 10 km/h
car1.accelerate(); // Toyota is now going 20 km/h
```

`car1` and `car2` are separate objects — changing `car1.speed` has zero
effect on `car2.speed`. Each object has its own copy of the fields.

## this keyword (brief preview — covered more with constructors next)

Inside a method, `this` refers to "the current object the method was
called on":

```java
void accelerate() {
    this.speed += 10; // same as just "speed += 10" here, but explicit
}
```

## Static vs instance — the key distinction

- Everything written before this topic (`static void main`, `static int
  add(...)`) belongs to the class itself, not to any object — callable
  without ever creating an object.
- Fields/methods without `static` (like `accelerate()` above) belong to
  each individual object — an actual object (`car1.accelerate()`) is
  required to call them.

## Practice Program

See:
- [`Car.java`](../../Code/08-oop/01-classes-and-objects/Car.java) — the
  class definition (fields + methods)
- [`ClassesAndObjectsDemo.java`](../../Code/08-oop/01-classes-and-objects/ClassesAndObjectsDemo.java) —
  a runnable example creating multiple independent `Car` objects and
  calling their methods

### Compiling and running

```bash
cd Code/08-oop/01-classes-and-objects
javac ClassesAndObjectsDemo.java Car.java
java ClassesAndObjectsDemo
```