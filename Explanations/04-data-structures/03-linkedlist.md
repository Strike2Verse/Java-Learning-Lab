# LinkedList

A `LinkedList` is another resizable list, like `ArrayList` — but built
differently under the hood. Instead of storing elements in one continuous
block of memory, a `LinkedList` stores each element as a separate node,
where each node points to the next (and previous) node — like a chain.

```
[Apple] <-> [Banana] <-> [Cherry]
```

## Import required

```java
import java.util.LinkedList;
```

## Shared API with ArrayList

Both `ArrayList` and `LinkedList` implement the same `List` interface, so
most methods work identically:

```java
LinkedList<String> fruits = new LinkedList<>();
fruits.add("Apple");
fruits.add("Banana");
fruits.add("Cherry");

System.out.println(fruits.get(0)); // Apple
fruits.remove("Banana");
System.out.println(fruits.size());
```

The real difference between them is in **performance characteristics**,
not usage syntax.

## LinkedList-specific methods

```java
fruits.addFirst("Mango");   // adds to the very beginning
fruits.addLast("Grape");    // adds to the very end
fruits.removeFirst();       // removes the first element
fruits.removeLast();        // removes the last element
System.out.println(fruits.peekFirst()); // look at first without removing
System.out.println(fruits.peekLast());  // look at last without removing
```

These operations only need to relink a couple of pointers — no shifting of
other elements required — which is why `LinkedList` is naturally suited
for use as a **Queue** or **Deque** (double-ended queue), and implements
those interfaces too.

## ArrayList vs LinkedList — when to use which

- **ArrayList** — faster for accessing elements by index (`get(i)`).
  Elements sit in one continuous memory block, so `get(i)` can jump
  directly to that address.
- **LinkedList** — faster for adding/removing at the beginning or middle.
  `get(i)`, on the other hand, has to walk node-by-node from the start (or
  end) until it reaches that position, which is slower for large lists.

For most everyday use, `ArrayList` is the default choice; `LinkedList`
shines specifically when frequently inserting/removing from the front or
needing queue-like behavior.

## Practice Program

See [`LinkedListDemo.java`](../../Code/04-data-structures/03-linkedlist/LinkedListDemo.java)
for a runnable example covering:
- Shared `List` methods (`add`, `get`, `remove`, `size`, looping)
- LinkedList-specific methods (`addFirst`, `addLast`, `removeFirst`,
  `removeLast`, `peekFirst`, `peekLast`)
- A note on the `get(index)` performance difference vs ArrayList