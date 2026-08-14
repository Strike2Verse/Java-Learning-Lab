# try, catch, finally, try-with-resources

Pieces of this were already seen in File Handling — here it's covered
properly as its own topic, with the full picture.

## Basic try-catch

```java
try {
    int result = 10 / 0;
} catch (ArithmeticException e) {
    System.out.println("Error: " + e.getMessage());
}
```

## Multiple catch blocks

```java
try {
    int[] arr = new int[5];
    arr[10] = 1;
} catch (ArrayIndexOutOfBoundsException e) {
    System.out.println("Array error: " + e.getMessage());
} catch (NullPointerException e) {
    System.out.println("Null error: " + e.getMessage());
}
```

Order matters — most specific exception types first, most general last
(or it won't compile), as covered in File Handling.

## Multi-catch (catching several types in one block)

Used when multiple exception types should be handled the **same way**,
combined with `|` instead of separate blocks:

```java
try {
    // risky code
} catch (ArithmeticException | NullPointerException e) {
    System.out.println("Something went wrong: " + e.getMessage());
}
```

## finally — always runs

```java
try {
    System.out.println("Trying...");
    int result = 10 / 0;
} catch (ArithmeticException e) {
    System.out.println("Caught it!");
} finally {
    System.out.println("Always runs.");
}
```

`finally` still runs even if the exception is never caught — it executes
before the exception propagates upward and eventually crashes the
program (or gets caught further up the call stack).

## try-with-resources (recap + why it matters)

Automatically closes any resource that implements `AutoCloseable`:

```java
try (var scanner = new java.util.Scanner(System.in)) {
    // use scanner
} // automatically closed here, even if an exception occurs
```

## The throw keyword — manually triggering an exception

```java
static void checkAge(int age) {
    if (age < 0) {
        throw new IllegalArgumentException("Age cannot be negative");
    }
    System.out.println("Age is valid: " + age);
}
```

`IllegalArgumentException` is a common built-in unchecked exception used
exactly for signaling that a method received a bad argument.

`throw` fires one specific exception instance right there in the code.
`throws` (different keyword, covered in the previous subtopic) is just a
declaration in the method signature, warning callers that a checked
exception might occur and needs to be handled.

## Nested try-catch (brief mention)

Nesting try-catch blocks is possible, but is generally a sign the code
could be restructured more cleanly — mentioned here just for recognition,
not something to actively practice.

## Practice Program

See [`TryCatchFinallyDemo.java`](../../Code/07-error-handling-and-exceptions/02-try-catch-finally-try-with-resources/TryCatchFinallyDemo.java)
for a runnable example covering:
- Basic try-catch
- Multiple catch blocks with different handling
- Multi-catch with `|`
- `finally` running after a caught exception
- `try-with-resources` with a `Scanner`
- The `throw` keyword with `IllegalArgumentException`