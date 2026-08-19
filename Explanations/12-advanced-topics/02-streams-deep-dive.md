# Streams API (deep dive)

Basic `filter`/`map`/`collect` were covered in Data Structures — this
goes deeper into operations and concepts not yet seen.

## Recap: the basic pattern

```java
list.stream()
    .filter(...)
    .map(...)
    .collect(Collectors.toList());
```

## reduce — combining all elements into a single result

```java
List<Integer> numbers = List.of(1, 2, 3, 4, 5);

int sum = numbers.stream()
    .reduce(0, (a, b) -> a + b); // start at 0, combine pairwise
System.out.println(sum); // 15

int product = numbers.stream()
    .reduce(1, (a, b) -> a * b);
System.out.println(product); // 120
```

`reduce` takes an identity value (starting point) and an accumulator
function — repeatedly applying it to build up one final result. The
accumulator should be associative (grouping order shouldn't matter),
since parallel streams may apply it in a different order than sequential
streams.

## sorted — sorting within a stream

```java
List<String> names = List.of("Charlie", "Alice", "Bob");

List<String> sorted = names.stream()
    .sorted() // natural order (Comparable)
    .collect(Collectors.toList());

List<String> sortedByLength = names.stream()
    .sorted(Comparator.comparingInt(String::length)) // custom Comparator
    .collect(Collectors.toList());
```

## distinct — removing duplicates

```java
List<Integer> withDupes = List.of(1, 2, 2, 3, 3, 3);
List<Integer> unique = withDupes.stream()
    .distinct()
    .collect(Collectors.toList());
System.out.println(unique); // [1, 2, 3]
```

`distinct()` relies on `equals()`/`hashCode()` internally — the same
hash-bucket-then-equals mechanism used by `HashSet` (from OOP's Object
Methods 1) — which is why correctly overriding both matters for custom
objects used in streams.

## limit and skip — controlling how many elements flow through

```java
List<Integer> firstThree = numbers.stream().limit(3).collect(Collectors.toList());   // [1, 2, 3]
List<Integer> afterTwo = numbers.stream().skip(2).collect(Collectors.toList());        // [3, 4, 5]
```

## Collectors beyond toList()

```java
import java.util.stream.Collectors;

String joined = names.stream().collect(Collectors.joining(", ")); // "Charlie, Alice, Bob"

Map<Integer, List<String>> groupedByLength = names.stream()
    .collect(Collectors.groupingBy(String::length)); // {5=[Alice], 3=[Bob], 7=[Charlie]}

double average = numbers.stream()
    .collect(Collectors.averagingInt(Integer::intValue));
```

## Method references — a shorthand for simple lambdas

`String::length` is equivalent to `s -> s.length()` — a method reference
is compact syntax when a lambda simply calls one existing method.

```java
names.stream().map(String::toUpperCase); // same as .map(s -> s.toUpperCase())
```

## Streams are lazy — nothing runs until a terminal operation

```java
Stream<String> stream = names.stream()
    .filter(name -> {
        System.out.println("Filtering: " + name); // won't print yet!
        return name.length() > 3;
    });
// nothing has actually run at this point — filter is "intermediate"

List<String> result = stream.collect(Collectors.toList()); // NOW it runs
```

Intermediate operations (`filter`, `map`, `sorted`, etc.) don't execute
until a terminal operation (`collect`, `forEach`, `reduce`) triggers the
whole chain. This is why chaining many intermediate operations is
efficient — each element is processed through the entire pipeline once,
rather than making separate passes or materializing intermediate lists at
every step.

## Practice Program

See [`StreamsDeepDiveDemo.java`](../../Code/12-advanced-topics/02-streams-deep-dive/StreamsDeepDiveDemo.java)
for a runnable example covering `reduce`, `sorted` (natural and custom),
`distinct`, `limit`/`skip`, `Collectors.joining`/`groupingBy`/
`averagingInt`, method references, and a demonstration of stream
laziness.