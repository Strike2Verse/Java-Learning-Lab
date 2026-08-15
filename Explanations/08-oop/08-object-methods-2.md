# Object Methods 2 (clone, compareTo, Comparable/Comparator)

The final subtopic of OOP — and of the current roadmap.

## Comparable — defining a natural sort order

`TreeSet`/`TreeMap` (from Data Structures) automatically sort elements,
but Java doesn't know how to sort custom objects by default — that's
defined via `Comparable`.

```java
public class Car implements Comparable<Car> {
    String brand;
    int speed;

    public Car(String brand, int speed) {
        this.brand = brand;
        this.speed = speed;
    }

    @Override
    public int compareTo(Car other) {
        return Integer.compare(this.speed, other.speed); // sort by speed, ascending
    }
}
```

`compareTo` returns: negative if `this` comes before `other`, zero if
equal, positive if `this` comes after. `Integer.compare(a, b)` is a safe
helper for this — avoid manually doing `a - b`, which can overflow for
extreme values.

```java
TreeSet<Car> cars = new TreeSet<>();
cars.add(new Car("Toyota", 50));
cars.add(new Car("Ferrari", 200));
cars.add(new Car("Honda", 30));

System.out.println(cars); // automatically sorted by speed: Honda, Toyota, Ferrari
```

## Comparator — custom/alternate sort orders (without changing the class)

`Comparable` only gives one "natural" order. `Comparator` defines extra,
flexible sort orders from outside the class.

```java
import java.util.Comparator;

Comparator<Car> byBrand = (a, b) -> a.brand.compareTo(b.brand);
```

```java
List<Car> carList = new ArrayList<>(cars);
carList.sort(byBrand); // sorts by brand instead of speed
```

## Comparable vs Comparator — when to use which

| | Comparable | Comparator |
|---|---|---|
| Defined | Inside the class itself | Outside the class, separately |
| How many | One per class (`compareTo`) | Unlimited (as many as needed) |
| Use case | The "default"/natural order | Alternate/situational orders |

## equals() and compareTo() should generally agree

If `a.equals(b)` is `true`, `a.compareTo(b)` should typically return `0`
— inconsistency between these can cause subtle bugs in sorted
collections like `TreeSet`.

## clone() — brief mention (rarely used in modern Java)

`clone()` (from `Object`) creates a copy of an object, but is widely
considered outdated and error-prone: it requires an awkward cast back
from `Object`, forces handling `CloneNotSupportedException` (a checked
exception that's rarely meaningful), doesn't play well with `final`
fields (since it bypasses constructors entirely), and `Cloneable` itself
is a famously poorly-designed marker interface.

Most developers now prefer a manual copy constructor instead:

```java
public Car(Car other) { // copy constructor — much clearer and safer than clone()
    this.brand = other.brand;
    this.speed = other.speed;
}
```

```java
Car original = new Car("Toyota", 50);
Car copy = new Car(original); // creates an independent copy
```

## Practice Program

See:
- [`Car.java`](../../Code/08-oop/08-object-methods-2/Car.java) —
  implements `Comparable`, plus a copy constructor
- [`ObjectMethods2Demo.java`](../../Code/08-oop/08-object-methods-2/ObjectMethods2Demo.java) —
  a runnable example covering `Comparable` (natural order), multiple
  `Comparator`s (by brand, by brand length then speed), and the copy
  constructor pattern

### Compiling and running

```bash
cd Code/08-oop/08-object-methods-2
javac ObjectMethods2Demo.java Car.java
java ObjectMethods2Demo
```