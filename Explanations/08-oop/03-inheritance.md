# Inheritance

Inheritance lets one class reuse the fields and methods of another class,
while adding or changing its own. The class being reused from is the
parent (superclass); the class doing the reusing is the child (subclass).

## Why it's useful

Multiple related classes (e.g. `SportsCar`, `Truck`) can share things
like `brand`, `speed`, and `accelerate()` without copy-pasting that code
into every class — they inherit from a common parent and just add what's
different.

## The extends keyword

```java
public class Car {
    String brand;
    int speed;

    void accelerate() {
        speed += 10;
        System.out.println(brand + " is now going " + speed + " km/h");
    }
}

public class SportsCar extends Car {
    boolean turboEnabled;

    void activateTurbo() {
        turboEnabled = true;
        System.out.println("Turbo activated!");
    }
}
```

```java
SportsCar myCar = new SportsCar();
myCar.brand = "Ferrari";    // inherited field, works even though SportsCar didn't declare it
myCar.accelerate();          // inherited method
myCar.activateTurbo();       // SportsCar's own method
```

## Calling the parent's constructor with super(...)

If the parent has a constructor, the child needs to call it — usually as
the first line of the child's own constructor, since the parent's part of
the object must be fully initialized first:

```java
public class Car {
    String brand;
    int speed;

    public Car(String brand) {
        this.brand = brand;
        this.speed = 0;
    }
}

public class SportsCar extends Car {
    boolean turboEnabled;

    public SportsCar(String brand) {
        super(brand); // calls Car's constructor
        this.turboEnabled = false;
    }
}
```

## Overriding a method

A child class can replace (override) a parent's method with its own
version, using `@Override`:

```java
public class SportsCar extends Car {
    @Override
    void accelerate() {
        speed += 20; // sports cars accelerate faster!
        System.out.println(brand + " zooms to " + speed + " km/h");
    }
}
```

`@Override` is a compile-time marker, not a behavior change — it doesn't
alter what the code does at runtime. Its purpose is catching mistakes
early: if the method name or signature doesn't actually match a parent
method, Java raises a compile error instead of silently creating an
unrelated new method.

## Calling the parent's version with super.method()

Used to extend the parent's behavior rather than fully replace it:

```java
@Override
void accelerate() {
    super.accelerate(); // runs Car's original accelerate() first
    System.out.println("Turbo boost!");
}
```

## Single inheritance only

A Java class can only `extends` one parent class (no multiple
inheritance). Java works around this limitation with interfaces, covered
later in the Abstraction subtopic.

## Practice Program

See:
- [`Car.java`](../../Code/08-oop/03-inheritance/Car.java) — the parent class
- [`SportsCar.java`](../../Code/08-oop/03-inheritance/SportsCar.java) — the
  child class, using `extends`, `super(...)`, `@Override`, and
  `super.accelerate()`
- [`InheritanceDemo.java`](../../Code/08-oop/03-inheritance/InheritanceDemo.java) —
  a runnable example comparing plain `Car` and `SportsCar` behavior

### Compiling and running

```bash
cd Code/08-oop/03-inheritance
javac InheritanceDemo.java Car.java SportsCar.java
java InheritanceDemo
```