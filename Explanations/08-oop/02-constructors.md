# Constructors

A constructor is a special method that runs automatically when an object
is created with `new`. Its job is to initialize the object's fields —
instead of setting them one by one after creation, they can all be set at
once, right when the object is born.

## Key rules for constructors

- Same name as the class
- No return type (not even `void`)
- Runs automatically when `new ClassName(...)` is called

## Without a constructor (fields set manually)

```java
Car car1 = new Car();
car1.brand = "Toyota";
car1.color = "Red";
car1.speed = 0;
```

## With a constructor

```java
public class Car {
    String brand;
    String color;
    int speed;

    public Car(String brand, String color) {
        this.brand = brand;   // "this.brand" = the field, "brand" = the parameter
        this.color = color;
        this.speed = 0;       // always start at 0
    }
}
```

```java
Car car1 = new Car("Toyota", "Red"); // fields set immediately, cleaner and safer
```

## Why this.brand = brand needs this

The parameter is also named `brand` — this is called **variable
shadowing**: the parameter temporarily hides the field within the
constructor's scope. Without `this`, `brand = brand;` would just assign
the parameter to itself, leaving the field `null`. `this.brand`
explicitly means "the field belonging to this object."

## The default constructor

If no constructor is written at all, Java secretly provides a free, empty
one:

```java
public class Car { } // Java automatically provides: public Car() { }
```

The moment any constructor is written, Java stops providing this free
one — a no-argument constructor must be written explicitly if still
needed.

## Constructor overloading

Multiple constructors with different parameters, just like regular
method overloading:

```java
public Car(String brand, String color) {
    this.brand = brand;
    this.color = color;
    this.speed = 0;
}

public Car(String brand, String color, int speed) {
    this.brand = brand;
    this.color = color;
    this.speed = speed;
}
```

```java
Car car1 = new Car("Toyota", "Red");        // uses first constructor
Car car2 = new Car("Honda", "Blue", 50);    // uses second constructor
```

## Constructor chaining with this(...)

Avoids duplicating logic between constructors by having one call
another:

```java
public Car(String brand, String color) {
    this(brand, color, 0); // calls the 3-parameter constructor with speed=0
}

public Car(String brand, String color, int speed) {
    this.brand = brand;
    this.color = color;
    this.speed = speed;
}
```

`this(...)` (with parentheses) calls another constructor in the same
class — different from `this.field` (with a dot), which refers to a
field on the current object.

## Practice Program

See:
- [`Car.java`](../../Code/08-oop/02-constructors/Car.java) — a class with
  overloaded, chained constructors
- [`ConstructorsDemo.java`](../../Code/08-oop/02-constructors/ConstructorsDemo.java) —
  a runnable example creating objects via both constructors

### Compiling and running

```bash
cd Code/08-oop/02-constructors
javac ConstructorsDemo.java Car.java
java ConstructorsDemo
```