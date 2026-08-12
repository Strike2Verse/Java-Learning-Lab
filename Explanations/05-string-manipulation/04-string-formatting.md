# String Formatting (String.format, text blocks)

## String.format — building formatted strings with placeholders

Instead of messy concatenation, `String.format` inserts values into a
template using format specifiers.

```java
String name = "Alice";
int age = 25;

String message = String.format("Name: %s, Age: %d", name, age);
System.out.println(message); // Name: Alice, Age: 25
```

## Common format specifiers

| Specifier | Meaning |
|---|---|
| `%s` | String |
| `%d` | Integer |
| `%f` | Floating-point (decimal) |
| `%c` | Character |
| `%b` | Boolean |
| `%n` | Newline (platform-safe, prefer over `\n`) |

## Controlling decimal places

```java
double price = 19.567;
System.out.println(String.format("Price: $%.2f", price)); // Price: $19.57
```

`%.2f` shows 2 digits after the decimal point, rounding as needed.

## Padding and width

```java
System.out.println(String.format("[%10s]", "hi"));  // [        hi]  (right-aligned, width 10)
System.out.println(String.format("[%-10s]", "hi")); // [hi        ] (left-aligned, width 10)
```

## printf — same idea, prints directly

```java
System.out.printf("Name: %s, Age: %d%n", name, age);
```

## Text blocks (Java 15+) — multi-line strings made easy

Before text blocks, multi-line strings were awkward:

```java
String oldWay = "Line 1\n" +
                "Line 2\n" +
                "Line 3";
```

Text blocks solve this with triple-quotes:

```java
String textBlock = """
        Line 1
        Line 2
        Line 3
        """;
```

- Starts with `"""` followed by a newline.
- Preserves formatting/line breaks exactly as written.
- Reduces the chance of bugs from a forgotten `\n` or misplaced `+`, on
  top of being more readable.
- Great for embedding things like JSON, SQL, or HTML snippets.

## Practice Program

See [`StringFormattingDemo.java`](../../Code/05-string-manipulation/04-string-formatting/StringFormattingDemo.java)
for a runnable example covering `String.format` with various specifiers,
decimal rounding, padding/width, `printf`, and a text block compared to
the old concatenation approach.