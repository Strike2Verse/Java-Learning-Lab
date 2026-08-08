# ArrayList

Regular arrays have a fixed size — once created, you can't add or remove
elements, only change existing ones. `ArrayList` solves this: it's a
resizable list that grows and shrinks automatically as you add/remove
items.

## Import required

```java
import java.util.ArrayList;
```

## Creating an ArrayList

```java
ArrayList<String> fruits = new ArrayList<>();
```

- `<String>` specifies what type of elements it holds — a **generic
  type**.
- `new ArrayList<>()` — the empty `<>` on the right is fine; Java infers
  the type from the left side.

## Adding elements

```java
fruits.add("Apple");
fruits.add("Banana");
fruits.add("Cherry");
```

## Accessing elements

```java
System.out.println(fruits.get(0)); // Apple
```

## Modifying an element

```java
fruits.set(1, "Blueberry"); // replaces "Banana" with "Blueberry"
```

## Removing elements

```java
fruits.remove("Cherry"); // removes by value
fruits.remove(0);        // removes by index
```

## Getting the size

```java
System.out.println(fruits.size());
```

`size()` is a **method** on `ArrayList`, unlike an array's `.length`,
which is a public final **field**.

## Looping through an ArrayList

```java
for (String fruit : fruits) {
    System.out.println(fruit);
}
```

## Checking if something exists

```java
System.out.println(fruits.contains("Blueberry")); // true or false
```

## ArrayLists and primitive types

Java generics (the `<...>` part) only work with objects, not primitives —
so `ArrayList<int>` is a compile-time error. Instead, the wrapper class is
used:

```java
ArrayList<Integer> numbers = new ArrayList<>();
numbers.add(5); // int 5 is automatically converted to Integer 5
```

This automatic conversion is called **autoboxing** (primitive → wrapper)
and **unboxing** (wrapper → primitive) — Java does it silently. This
pattern applies to every primitive type: `int` → `Integer`, `double` →
`Double`, `boolean` → `Boolean`, `char` → `Character`.

## Practice Program

See [`ArrayListDemo.java`](../../Code/04-data-structures/02-arraylist/ArrayListDemo.java)
for a runnable example covering:
- Creating, adding, accessing, modifying, and removing elements
- Getting the size and looping through the list
- Checking whether an element exists with `contains`
- Using `ArrayList<Integer>` with autoboxing/unboxing