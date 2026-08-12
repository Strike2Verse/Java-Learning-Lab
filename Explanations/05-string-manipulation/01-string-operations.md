# String Operations

A `String` is a sequence of characters. Strings in Java are **immutable**
— once created, a `String` object can never be changed. Every
"modification" actually creates a new `String` object.

## Creating Strings

```java
String name1 = "Alice";              // string literal
String name2 = new String("Bob");    // explicit object (rarely used, but good to know)
```

## Concatenation (joining strings)

```java
String first = "John";
String last = "Doe";

String full1 = first + " " + last;             // using +
String full2 = first.concat(" ").concat(last); // using .concat()

System.out.println(full1); // John Doe
```

## Comparing Strings — the classic beginner trap

```java
String a = "hello";
String b = "hello";
String c = new String("hello");

System.out.println(a == b);        // true  (same literal, same memory reference — string pool)
System.out.println(a == c);        // false (different object in memory)
System.out.println(a.equals(c));   // true  (compares actual content)
```

`==` checks whether two references point to the **same object in
memory**, not whether the text is the same. String literals like `a` and
`b` share a single object in the string pool, so `==` happens to work for
them — but `new String(...)` always creates a separate object, so `==`
fails even though the text is identical.

**Rule of thumb: always use `.equals()` to compare String content, never
`==`.**

## Why immutability matters

```java
String s = "Hello";
s.concat(" World");        // this does NOT change s!
System.out.println(s);     // still prints "Hello"

s = s.concat(" World");    // must reassign to actually capture the change
System.out.println(s);     // now prints "Hello World"
```

`s.concat(" World")` creates a brand-new String — the original `"Hello"`
object is untouched. The second line works only because `s` is
**reassigned** to point at the new String; the original object still
exists, just nothing refers to it anymore.

## Practice Program

See [`StringOperations.java`](../../Code/05-string-manipulation/01-string-operations/StringOperations.java)
for a runnable example covering:
- Creating strings via literal and `new String(...)`
- Concatenation with `+` and `.concat()`
- `==` vs `.equals()` comparison, including the `new String(...)` trap
- Immutability demonstrated with and without reassignment