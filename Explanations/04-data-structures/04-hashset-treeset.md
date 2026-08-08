# HashSet / TreeSet

A `Set` is a collection that stores unique values only — no duplicates
allowed. Trying to add something that's already there is silently
ignored (no error, it just doesn't get added again).

## HashSet

Stores elements with no guaranteed order — fast for adding, removing, and
checking existence.

```java
import java.util.HashSet;

HashSet<String> names = new HashSet<>();
names.add("Alice");
names.add("Bob");
names.add("Alice"); // ignored — already exists

System.out.println(names); // order not guaranteed, e.g. [Bob, Alice]
System.out.println(names.size()); // 2, not 3
```

Checking and removing:

```java
System.out.println(names.contains("Bob")); // true
names.remove("Bob");
```

## TreeSet

Same "unique values only" rule, but automatically keeps elements sorted.

```java
import java.util.TreeSet;

TreeSet<Integer> numbers = new TreeSet<>();
numbers.add(50);
numbers.add(10);
numbers.add(30);

System.out.println(numbers); // [10, 30, 50] — always sorted ascending
```

Useful TreeSet-specific methods:

```java
System.out.println(numbers.first()); // smallest element
System.out.println(numbers.last());  // largest element
```

`TreeSet` keeps track of order automatically, so getting the min/max is
instant — with `HashSet`, you'd have to loop through everything yourself
to find them.

## HashSet vs TreeSet — when to use which

- **HashSet** — use when uniqueness is all that's needed and order
  doesn't matter; generally faster.
- **TreeSet** — use when uniqueness **and** automatically maintained
  sorted order are both needed.

## Looping through a Set

Same as any collection:

```java
for (String name : names) {
    System.out.println(name);
}
```

## Practice Program

See [`HashSetTreeSetDemo.java`](../../Code/04-data-structures/04-hashset-treeset/HashSetTreeSetDemo.java)
for a runnable example covering:
- `HashSet` duplicate handling, `contains`, `remove`, and looping
- `TreeSet` duplicate handling, automatic sorting, and `first()`/`last()`