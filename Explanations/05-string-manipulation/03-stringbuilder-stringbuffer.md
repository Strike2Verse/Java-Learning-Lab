# StringBuilder / StringBuffer

`String` is immutable — every concatenation creates a new object. If
you're building a string inside a loop with many concatenations, this
becomes wasteful:

```java
String result = "";
for (int i = 0; i < 5; i++) {
    result += i; // creates a NEW String object every single time
}
```

`StringBuilder` solves this — it's a mutable sequence of characters. It
changes in place, without creating a new object each time.

## Creating a StringBuilder

```java
StringBuilder sb = new StringBuilder();
StringBuilder sb2 = new StringBuilder("Hello"); // can start with initial text
```

## Common methods

```java
sb.append("Hello");              // adds to the end
sb.append(" ").append("World");  // methods can be chained
System.out.println(sb);          // Hello World

sb.insert(5, ",");   // inserts at a specific index
sb.delete(5, 6);     // removes characters in an index range (end exclusive)
sb.reverse();        // reverses the whole sequence
sb.replace(6, 11, "Java"); // replaces characters in that index range
```

## Converting back to a String

```java
String finalResult = sb.toString();
```

## StringBuilder vs StringBuffer

Same methods, same behavior — the only difference:

- **StringBuilder** — faster, but not thread-safe (fine for almost all
  everyday code).
- **StringBuffer** — slightly slower, but thread-safe (synchronized, safe
  when multiple threads modify it at once).

Rule of thumb: use `StringBuilder` by default. Only reach for
`StringBuffer` when specifically dealing with multithreading (covered
later in Advanced Topics).

## Practice Program

See [`StringBuilderStringBufferDemo.java`](../../Code/05-string-manipulation/03-stringbuilder-stringbuffer/StringBuilderStringBufferDemo.java)
for a runnable example covering:
- The inefficiency of `String +=` in a loop
- `append`, `insert`, `delete`, `reverse`, `replace` on a `StringBuilder`
- Converting a `StringBuilder` to a `String`
- A basic `StringBuffer` example