# Polymorphism

"Poly" = many, "morph" = forms. Polymorphism means the same method call
can behave differently depending on the actual object it's called on —
building directly on method overriding from Inheritance.

## A parent-type reference can hold a child object

```java
Car myCar = new SportsCar("Ferrari"); // reference type is Car, actual object is SportsCar
myCar.accelerate(); // runs SportsCar's overridden version, not Car's!
```

This works because `SportsCar` **is-a** `Car`. Java looks at the actual
object type at runtime to decide which `accelerate()` to run — not the
declared reference type. This is called runtime polymorphism (dynamic
method dispatch).

## Why this is useful: treating different objects uniformly

```java
Car[] cars = {
    new Car("Honda"),
    new SportsCar("Ferrari"),
    new SportsCar("Lamborghini")
};

for (Car car : cars) {
    car.accelerate(); // each one runs its OWN version automatically
}
```

No need to check "is this a SportsCar or a regular Car?" — calling
`accelerate()` automatically picks the right version for each object.
This is the real power of polymorphism: code that works uniformly across
a whole family of related classes.

## Polymorphism with method parameters

```java
static void testDrive(Car car) { // accepts ANY Car or subclass of Car
    car.accelerate();
}
```

```java
testDrive(new Car("Toyota"));       // works
testDrive(new SportsCar("Ferrari")); // also works — SportsCar IS-A Car
```

## instanceof — checking the actual type at runtime

Sometimes the specific type is needed to access subclass-only features:

```java
Car myCar = new SportsCar("Ferrari");

if (myCar instanceof SportsCar) {
    SportsCar sc = (SportsCar) myCar; // casting to access SportsCar-only methods
    sc.activateTurbo();
}
```

Modern Java (16+) combines the check and cast in one line:

```java
if (myCar instanceof SportsCar sc) {
    sc.activateTurbo(); // "sc" is already cast and ready to use here
}
```

## Overloading vs Overriding

- **Overloading** — same class, same method name, different parameters,
  resolved at compile time.
- **Overriding** — parent vs child class, same method name, identical
  parameters, resolved at runtime.

## Practice Program

See:
- [`Car.java`](../../Code/08-oop/04-polymorphism/Car.java) — parent class
- [`SportsCar.java`](../../Code/08-oop/04-polymorphism/SportsCar.java) —
  child class with an overridden `accelerate()`
- [`PolymorphismDemo.java`](../../Code/08-oop/04-polymorphism/PolymorphismDemo.java) —
  a runnable example covering runtime polymorphism, an array of mixed
  subtypes, a polymorphic method parameter, and `instanceof` pattern
  matching

### Compiling and running

```bash
cd Code/08-oop/04-polymorphism
javac PolymorphismDemo.java Car.java SportsCar.java
java PolymorphismDemo
``` 