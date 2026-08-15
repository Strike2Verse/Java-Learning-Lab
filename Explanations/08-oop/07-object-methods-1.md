# Object Methods 1 (toString, equals, hashCode)

Every class in Java automatically inherits from a hidden parent class
called `Object` — even without writing `extends Object`. `Object`
provides several default methods, three of which are commonly
overridden: `toString()`, `equals()`, and `hashCode()`.

## toString() — controlling how an object prints

```java
public class Car {
    String brand;
    int speed;

    public Car(String brand, int speed) {
        this.brand = brand;
        this.speed = speed;
    }
}
```

```java
Car car = new Car("Toyota", 50);
System.out.println(car); // Car@1b6d3586 (default: class name + memory hash — not useful!)
```

`println(obj)` internally calls `String.valueOf(obj)`, which null-checks
first and then calls `obj.toString()`. Without overriding, the default
`toString()` just prints the class name plus a memory-address-like hash.

Fix — override it:

```java
@Override
public String toString() {
    return brand + " going " + speed + " km/h";
}
```

```java
System.out.println(car); // Toyota going 50 km/h — much better!
```

## equals() — comparing objects by content, not reference

`Object`'s default `equals()` just does `==` (reference comparison), same
as with Strings:

```java
Car car1 = new Car("Toyota", 50);
Car car2 = new Car("Toyota", 50);
System.out.println(car1.equals(car2)); // false by default — different objects!
```

Fix — override it to compare actual field values:

```java
@Override
public boolean equals(Object obj) {
    if (this == obj) return true;               // same object reference
    if (obj == null || getClass() != obj.getClass()) return false; // null or different type
    Car other = (Car) obj;                       // safe to cast now
    return speed == other.speed && brand.equals(other.brand);
}
```

```java
System.out.println(car1.equals(car2)); // true now — same brand and speed
```

## hashCode() — must be overridden alongside equals()

If `equals()` is overridden, `hashCode()` must be overridden too —
otherwise `HashSet`/`HashMap` behave incorrectly, since they rely on
`hashCode()` to decide which "bucket" an object belongs in before even
checking `equals()` within that bucket.

```java
@Override
public int hashCode() {
    return Objects.hash(brand, speed); // built-in helper, combines fields into one hash
}
```

*(requires `import java.util.Objects;`)*

If two "equal" objects (per `equals()`) produce different hash codes,
they can land in different buckets — meaning the collection never even
attempts the `equals()` comparison, letting duplicates slip in and
causing lookups (`contains()`, `get()`) to fail unexpectedly.

## Why this matters together

```java
HashSet<Car> cars = new HashSet<>();
cars.add(new Car("Toyota", 50));
cars.add(new Car("Toyota", 50)); // "duplicate" by value

System.out.println(cars.size()); // 1 if equals()+hashCode() are overridden correctly, 2 if not
```

## Practice Program

See:
- [`Car.java`](../../Code/08-oop/07-object-methods-1/Car.java) — overrides
  `toString()`, `equals()`, and `hashCode()`
- [`ObjectMethods1Demo.java`](../../Code/08-oop/07-object-methods-1/ObjectMethods1Demo.java) —
  a runnable example covering all three overrides plus the `HashSet`
  duplicate-detection payoff

### Compiling and running

```bash
cd Code/08-oop/07-object-methods-1
javac ObjectMethods1Demo.java Car.java
java ObjectMethods1Demo
```