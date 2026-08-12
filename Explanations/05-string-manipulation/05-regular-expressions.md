# Working with Regular Expressions (java.util.regex)

A regular expression (regex) is a pattern used to match, search, or
validate text — useful for things like checking if an email is valid,
finding all numbers in a string, or replacing specific patterns.

## Import required

```java
import java.util.regex.Pattern;
import java.util.regex.Matcher;
```

## Basic pattern matching with String methods (no imports needed)

```java
String text = "Hello123World456";
System.out.println(text.matches("[a-zA-Z0-9]+")); // true — entire string matches this pattern
```

`matches()` requires the **entire** string to fit the pattern.

## Common regex building blocks

| Pattern | Meaning |
|---|---|
| `\d` | Any digit (0-9) |
| `\D` | Any non-digit |
| `\w` | Any word character (letters, digits, underscore) |
| `\s` | Any whitespace |
| `+` | One or more of the previous |
| `*` | Zero or more of the previous |
| `?` | Zero or one of the previous |
| `[a-z]` | Any lowercase letter (range) |
| `^` | Start of string |
| `$` | End of string |

## Using Pattern and Matcher for more control

```java
String text = "My numbers are 42 and 108";
Pattern pattern = Pattern.compile("\\d+"); // \\d because \ needs escaping in a Java string
Matcher matcher = pattern.matcher(text);

while (matcher.find()) {
    System.out.println("Found: " + matcher.group());
}
// Found: 42
// Found: 108
```

`find()` scans for the pattern **anywhere** in the string, one match at a
time — this is why it's used in a loop, to catch every occurrence. This
is the key difference from `matches()`, which checks the whole string at
once.

Note: `\\d` (double backslash) is needed in the Java string because `\`
starts an escape sequence in Java strings — `\\` produces a literal
backslash, which the regex engine then reads as `\d`.

## Replacing using regex

```java
String messy = "Hello    World";
String clean = messy.replaceAll("\\s+", " "); // collapse multiple spaces into one
System.out.println(clean); // Hello World
```

## Validating something practical (basic email check)

```java
String email = "test@example.com";
boolean isValid = email.matches("^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$");
System.out.println(isValid); // true
```

This is a simplified pattern for learning purposes — real-world email
validation is more complex.

## Splitting with regex

```java
String data = "apple, banana,  cherry";
String[] items = data.split(",\\s*"); // split on comma, followed by zero or more spaces
```

## Practice Program

See [`RegularExpressionsDemo.java`](../../Code/05-string-manipulation/05-regular-expressions/RegularExpressionsDemo.java)
for a runnable example covering:
- `matches()` on a whole string
- `Pattern`/`Matcher` with `find()` to locate all occurrences
- `replaceAll()` to collapse whitespace
- A basic email validation pattern
- `split()` using a regex pattern