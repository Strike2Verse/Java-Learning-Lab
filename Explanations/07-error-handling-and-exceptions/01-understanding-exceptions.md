# Understanding Exceptions (Checked vs Unchecked)

An exception is an event that disrupts the normal flow of a program —
something went wrong (file missing, invalid input, division by zero,
etc.) and Java needs a way to signal that and let the code respond,
instead of just crashing silently.

## The exception hierarchy (simplified)

```
Throwable
├── Error              (serious JVM-level problems — don't try to catch these)
└── Exception
    ├── Checked Exceptions    (must be handled or declared)
    └── RuntimeException      (Unchecked Exceptions — handling is optional)
```

`Error` and `Exception` sit side by side under `Throwable`.

## Checked Exceptions

Java forces these to either be `catch`-ed or declared with `throws` — the
code won't compile otherwise. These represent problems that are somewhat
expected/recoverable (like a missing file).

```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public void readFile() throws IOException { // must declare, or wrap in try-catch
    Files.readString(Path.of("missing.txt"));
}
```

`IOException` (from File Handling) is a checked exception — this is why
every file method used earlier needed either a `try-catch` or a `throws`
on `main`.

## Unchecked Exceptions (RuntimeExceptions)

Java does not force these to be handled — the code compiles fine even if
they're ignored. These usually represent programming bugs (things that
shouldn't happen if the code is correct).

```java
int[] arr = new int[5];
System.out.println(arr[10]); // ArrayIndexOutOfBoundsException — unchecked, compiles fine, crashes at runtime
```

Common unchecked exceptions already seen:

- `ArrayIndexOutOfBoundsException`
- `NullPointerException`
- `ArithmeticException` (e.g., dividing by zero)
- `NumberFormatException` (e.g., parsing "abc" as an int)

## Why the distinction exists

- **Checked** = "this might legitimately happen, even in correct code —
  plan for it" (file might not exist, network might fail).
- **Unchecked** = "this happens because of a bug — fix the code, don't
  just catch-and-ignore it."

## Why Error shouldn't typically be caught

`Error` represents serious, usually unrecoverable JVM-level problems, such
as:

- `OutOfMemoryError` — the JVM ran out of memory
- `StackOverflowError` — infinite/too-deep recursion
- `NoClassDefFoundError` — a required class failed to load

These aren't "fixable and continue" situations — catching them rarely
actually fixes anything and can hide how serious the problem really was.
The convention is to let `Error`s propagate and crash the program.

## Practice Program

See [`UnderstandingExceptions.java`](../../Code/07-error-handling-and-exceptions/01-understanding-exceptions/UnderstandingExceptions.java)
for a runnable example covering:
- A checked exception (`IOException`) that must be declared or caught
- An unchecked exception (`ArrayIndexOutOfBoundsException`)
- Other common unchecked exceptions: `NullPointerException`,
  `ArithmeticException`, `NumberFormatException`