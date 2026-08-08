# Stream operations on collections (map, filter, collect)

A `Stream` lets you process collections (like `ArrayList`) in a
declarative way — describing *what* you want done, rather than manually
writing loops for *how* to do it. Streams don't store data themselves;
they operate on a source (a collection) and produce a result.

## Import required

```java
import java.util.stream.Collectors;
// java.util.List and java.util.ArrayList also needed for the examples below
```

## The basic pattern

```java
source.stream()
      .intermediateOperation()  // can chain many of these
      .terminalOperation();     // ends the stream, produces a result
```

## filter — keep only elements matching a condition

```java
List<Integer> numbers = List.of(1, 2, 3, 4, 5, 6);

List<Integer> evens = numbers.stream()
    .filter(n -> n % 2 == 0)
    .collect(Collectors.toList());

System.out.println(evens); // [2, 4, 6]
```

## map — transform each element into something else

```java
List<Integer> squared = numbers.stream()
    .map(n -> n * n)
    .collect(Collectors.toList());

System.out.println(squared); // [1, 4, 9, 16, 25, 36]
```

## collect — gather the stream's results back into a collection

`Collectors.toList()` gathers the stream back into a `List`. This is a
**terminal** operation — it closes the stream, so it's almost always the
last step in a chain; nothing can process the stream further after it.

## Chaining filter + map together

```java
List<Integer> result = numbers.stream()
    .filter(n -> n % 2 == 0)  // keep evens: 2, 4, 6
    .map(n -> n * n)           // square them: 4, 16, 36
    .collect(Collectors.toList());

System.out.println(result); // [4, 16, 36]
```

## Does order matter?

Yes — but not always in an obvious way. Swapping `filter` and `map` can
give the *same* result in some cases and a *completely different* result
in others, depending on the operations involved.

Same result either way (squaring preserves even/odd-ness):

```java
numbers.stream().filter(n -> n % 2 == 0).map(n -> n * n);
numbers.stream().map(n -> n * n).filter(n -> n % 2 == 0);
// both give [4, 16, 36]
```

Different result depending on order:

```java
numbers.stream().filter(n -> n > 3).map(n -> n - 3);
// [1, 2, 3]

numbers.stream().map(n -> n - 3).filter(n -> n > 3);
// [] — nothing left after subtracting 3 first
```

As a general habit, putting `filter` before `map` is often more efficient
too, since it reduces the number of elements before the (potentially more
expensive) transformation runs on each one.

## Other common terminal operations

```java
long count = numbers.stream().filter(n -> n > 3).count(); // counts matches
boolean anyMatch = numbers.stream().anyMatch(n -> n > 5);  // true/false
```

## Practice Program

See [`StreamOperationsDemo.java`](../../Code/04-data-structures/06-stream-operations/StreamOperationsDemo.java)
for a runnable example covering:
- `filter` and `map` individually
- Chaining `filter` + `map`
- A same-result-either-order case and a different-result case
- `count()` and `anyMatch()`