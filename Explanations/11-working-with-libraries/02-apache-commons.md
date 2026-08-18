# Apache Commons

Apache Commons is a collection of separate libraries, not one single
thing — each targeting a different area (strings, collections, files,
math, etc.). The most commonly used one is **Commons Lang**, which fills
in small but genuinely useful gaps in Java's standard library.

## Dependency (for reference)

```xml
<dependency>
    <groupId>org.apache.commons</groupId>
    <artifactId>commons-lang3</artifactId>
    <version>3.14.0</version>
</dependency>
```

## StringUtils — safer string operations

Regular `String` methods crash on `null` (`NullPointerException`,
covered in Error Handling). `StringUtils` handles `null` gracefully
instead.

```java
import org.apache.commons.lang3.StringUtils;

String value = null;

// Regular Java: value.isEmpty() would throw NullPointerException!
System.out.println(StringUtils.isEmpty(value));   // true — handles null safely
System.out.println(StringUtils.isBlank(value));    // true — also handles null

System.out.println(StringUtils.isEmpty(""));        // true
System.out.println(StringUtils.isEmpty("  "));      // false (not empty, has spaces)
System.out.println(StringUtils.isBlank("  "));       // true (blank = empty or whitespace)
```

Other handy `StringUtils` methods:

```java
System.out.println(StringUtils.capitalize("hello"));      // Hello
System.out.println(StringUtils.reverse("hello"));           // olleh
System.out.println(StringUtils.repeat("ab", 3));             // ababab
System.out.println(StringUtils.trim(null));                   // null (safe — doesn't throw)
System.out.println(StringUtils.defaultIfBlank(null, "N/A")); // N/A — fallback for null/blank
```

## RandomStringUtils — generating random strings

```java
import org.apache.commons.lang3.RandomStringUtils;

String randomAlpha = RandomStringUtils.randomAlphabetic(8);  // e.g. "XjKpQzRt"
String randomNumeric = RandomStringUtils.randomNumeric(6);    // e.g. "482913"
```

## ArrayUtils — array helpers Java doesn't provide natively

```java
import org.apache.commons.lang3.ArrayUtils;

int[] numbers = {1, 2, 3};
int[] withNewElement = ArrayUtils.add(numbers, 4);       // {1, 2, 3, 4} — arrays are fixed-size, remember!
boolean contains = ArrayUtils.contains(numbers, 2);        // true
int[] reversed = ArrayUtils.clone(numbers);
ArrayUtils.reverse(reversed);                                // {3, 2, 1}
```

## Why use Commons instead of writing these yourself?

Null-safe string checks (and similar utilities) could be written by hand
— and were, informally, throughout Error Handling and String
Manipulation — but Commons Lang is battle-tested, widely used, and avoids
subtly re-inventing (and possibly getting wrong) utility code that
thousands of other projects already rely on.

## Reference File

See [`ApacheCommonsExample.java`](../../Code/11-working-with-libraries/02-apache-commons/ApacheCommonsExample.java)
for a reference example covering `StringUtils` (null-safety and other
helpers), `RandomStringUtils`, and `ArrayUtils`. Requires the
commons-lang3 dependency to actually compile and run.