# HashMap / TreeMap

A `Map` stores data as key-value pairs — each key is unique and maps to
exactly one value. Think of it like a dictionary: look up a word (key) to
get its meaning (value).

## HashMap

No guaranteed order — fast for adding, looking up, and removing by key.

```java
import java.util.HashMap;

HashMap<String, Integer> ages = new HashMap<>();
ages.put("Alice", 25);
ages.put("Bob", 30);
ages.put("Alice", 26); // overwrites — keys are unique, values can change

System.out.println(ages); // order not guaranteed
System.out.println(ages.get("Alice")); // 26
```

Checking, removing, and other common methods:

```java
System.out.println(ages.containsKey("Bob"));   // true
System.out.println(ages.containsValue(30));    // true
ages.remove("Bob");
System.out.println(ages.size());
```

## Looping through a HashMap

```java
for (String name : ages.keySet()) {
    System.out.println(name + " -> " + ages.get(name));
}
```

More efficient — one lookup instead of two (requires
`import java.util.Map;` in addition to `HashMap`):

```java
for (Map.Entry<String, Integer> entry : ages.entrySet()) {
    System.out.println(entry.getKey() + " -> " + entry.getValue());
}
```

## Missing keys return null

Looking up a key that doesn't exist returns `null`, not an error:

```java
System.out.println(ages.get("Charlie")); // null
```

Using a `null` result without checking can cause a
`NullPointerException`. `getOrDefault()` avoids this by providing a
fallback value:

```java
System.out.println(ages.getOrDefault("Charlie", 0)); // 0
```

## TreeMap

Same key-value idea, but automatically keeps entries sorted by key.

```java
import java.util.TreeMap;

TreeMap<String, Integer> scores = new TreeMap<>();
scores.put("Charlie", 80);
scores.put("Alice", 95);
scores.put("Bob", 88);

System.out.println(scores); // {Alice=95, Bob=88, Charlie=80} — sorted by key
```

Useful TreeMap-specific methods:

```java
System.out.println(scores.firstKey()); // Alice
System.out.println(scores.lastKey());  // Charlie
```

## HashMap vs TreeMap — when to use which

- **HashMap** — fastest general-purpose choice when order doesn't matter.
- **TreeMap** — use when entries need to be automatically sorted by key.

## Practice Program

See [`HashMapTreeMapDemo.java`](../../Code/04-data-structures/05-hashmap-treemap/HashMapTreeMapDemo.java)
for a runnable example covering:
- `HashMap` put, overwrite, get, containsKey/containsValue, remove, size
- Looping with `keySet()` and the more efficient `entrySet()`
- Missing-key behavior (`null`) and `getOrDefault()`
- `TreeMap` automatic sorting and `firstKey()`/`lastKey()`