# Generics

Generics have already been used throughout the roadmap (`ArrayList<String>`,
`HashMap<K,V>`) — this covers how to write custom generic classes and
methods.

## The problem generics solve

Without generics, a class would need to pick one specific type upfront,
or use `Object` and cast everywhere (unsafe, error-prone):

```java
public class Box {
    private Object content;
    public void set(Object content) { this.content = content; }
    public Object get() { return content; }
}
```

```java
Box box = new Box();
box.set("hello");
String s = (String) box.get(); // manual cast required — ugly, and unsafe if wrong type was stored
```

## Writing a generic class

```java
public class Box<T> { // T = "Type" — a placeholder, filled in when used
    private T content;

    public void set(T content) {
        this.content = content;
    }

    public T get() {
        return content;
    }
}
```

```java
Box<String> stringBox = new Box<>();
stringBox.set("hello");
String s = stringBox.get(); // no cast needed — compiler already knows it's a String

Box<Integer> intBox = new Box<>();
intBox.set(42);
// intBox.set("oops"); // COMPILE ERROR — caught immediately, not at runtime
```

The core benefit: type safety at compile time, instead of discovering
type mistakes as a `ClassCastException` at runtime.

## Generic methods (independent of the class)

```java
public class Utils {
    public static <T> T firstElement(List<T> list) {
        return list.get(0);
    }
}
```

```java
List<String> names = List.of("Alice", "Bob");
String first = Utils.firstElement(names); // T inferred as String automatically
```

## Multiple type parameters

```java
public class Pair<K, V> {
    private K key;
    private V value;

    public Pair(K key, V value) {
        this.key = key;
        this.value = value;
    }

    public K getKey() { return key; }
    public V getValue() { return value; }
}
```

```java
Pair<String, Integer> entry = new Pair<>("age", 25);
```

This is literally how `Map.Entry<K, V>` works internally.

## Bounded type parameters — restricting what T can be

```java
public class NumberBox<T extends Number> { // T must be Number or a subclass
    private T value;

    public NumberBox(T value) {
        this.value = value;
    }

    public double doubled() {
        return value.doubleValue() * 2; // safe — guaranteed to have Number's methods
    }
}
```

```java
NumberBox<Integer> box = new NumberBox<>(5);
// NumberBox<String> invalid = new NumberBox<>("hi"); // COMPILE ERROR — String isn't a Number
```

## Wildcards (brief intro) — ? extends and ? super

Used when the exact type doesn't need to be known, just a constraint:

```java
public static double sumAll(List<? extends Number> numbers) { // accepts List<Integer>, List<Double>, etc.
    double total = 0;
    for (Number n : numbers) {
        total += n.doubleValue();
    }
    return total;
}
```

## Practice Program

See:
- [`Box.java`](../../Code/12-advanced-topics/01-generics/Box.java) — basic generic class
- [`Pair.java`](../../Code/12-advanced-topics/01-generics/Pair.java) — multiple type parameters
- [`NumberBox.java`](../../Code/12-advanced-topics/01-generics/NumberBox.java) — bounded type parameter
- [`GenericsDemo.java`](../../Code/12-advanced-topics/01-generics/GenericsDemo.java) —
  a runnable example covering all of the above plus a generic method and
  a wildcard parameter

### Compiling and running

```bash
cd Code/12-advanced-topics/01-generics
javac GenericsDemo.java Box.java Pair.java NumberBox.java
java GenericsDemo
```