# String Methods

Java's `String` class comes packed with useful built-in methods. Here are
the most commonly used ones.

## Length

```java
String text = "Hello World";
System.out.println(text.length()); // 11
```

## Case conversion

```java
System.out.println(text.toUpperCase()); // HELLO WORLD
System.out.println(text.toLowerCase()); // hello world
```

## Trimming whitespace

```java
String padded = "   Hello   ";
System.out.println(padded.trim());  // "Hello"
```

## Substring — extracting part of a string

```java
System.out.println(text.substring(6));     // "World" (index 6 to end)
System.out.println(text.substring(0, 5));  // "Hello" (index 0 up to, not including, 5)
```

The end index is **exclusive** — `substring(0, 5)` gives indexes 0
through 4.

## Searching within a string

```java
System.out.println(text.indexOf("World"));    // 6
System.out.println(text.contains("Hello"));   // true
System.out.println(text.startsWith("Hello")); // true
System.out.println(text.endsWith("World"));   // true
```

## Replacing characters/text

```java
System.out.println(text.replace("World", "Java")); // "Hello Java"
```

Like other String methods, `.replace()` returns a **new** String — it
does not modify the original variable. To keep the change, reassign it:
`text = text.replace(...)`.

## Splitting a string into parts

```java
String csv = "apple,banana,cherry";
String[] fruits = csv.split(",");
// fruits = ["apple", "banana", "cherry"]
```

## Checking if empty

```java
String empty = "";
System.out.println(empty.isEmpty()); // true
System.out.println(empty.isBlank()); // true

System.out.println("   ".isEmpty()); // false — has characters (spaces count)
System.out.println("   ".isBlank()); // true  — no visible content (Java 11+)
```

`isEmpty()` only checks for zero length. `isBlank()` treats
whitespace-only strings as effectively blank too.

## Getting a single character

```java
System.out.println(text.charAt(0)); // 'H'
```

## Practice Program

See [`StringMethods.java`](../../Code/05-string-manipulation/02-string-methods/StringMethods.java)
for a runnable example covering length, case conversion, trimming,
substring, searching, replacing, splitting, empty/blank checks, and
`charAt`.