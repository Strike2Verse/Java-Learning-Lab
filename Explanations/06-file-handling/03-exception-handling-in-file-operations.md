# Exception Handling in File Operations

File operations depend on the outside world — the file might not exist,
permissions might be wrong, the disk might be full, another program might
have it locked. Java forces acknowledgment of this through **checked
exceptions**.

## IOException — the common parent for file errors

Almost every file operation can throw `IOException` (or a subclass of it,
like `FileNotFoundException` or `NoSuchFileException`).

## Basic try-catch around file operations

```java
try {
    String content = Files.readString(Path.of("missing.txt"));
    System.out.println(content);
} catch (IOException e) {
    System.out.println("Could not read file: " + e.getMessage());
}
```

## try-with-resources — the proper way to handle closable resources

Older-style file I/O (like `FileReader`, `BufferedWriter`) needs to be
explicitly closed after use, or it risks resource leaks.
`try-with-resources` automatically closes them, even if an error occurs.

```java
try (BufferedReader reader = new BufferedReader(new FileReader("output.txt"))) {
    String line;
    while ((line = reader.readLine()) != null) {
        System.out.println(line);
    }
} catch (IOException e) {
    System.out.println("Error reading file: " + e.getMessage());
}
```

- Anything inside the `try (...)` parentheses that implements
  `AutoCloseable` gets closed automatically at the end — no manual
  `finally { reader.close(); }` block needed.
- Beyond convenience, it also preserves the *original* exception as
  primary if both the operation and the close() call fail, attaching the
  close failure as a suppressed exception instead of silently replacing
  the real error.
- This is why `Files.list()` (from the previous subtopic) is used with
  `try (var stream = Files.list(...))` — it returns a `Stream` that holds
  a file handle open, so it must be closed properly too.

## Catching specific exceptions

```java
try {
    Files.readString(Path.of("missing.txt"));
} catch (NoSuchFileException e) {
    System.out.println("File not found: " + e.getFile());
} catch (IOException e) {
    System.out.println("Some other file error: " + e.getMessage());
}
```

`NoSuchFileException` must be caught **before** `IOException`, since it is
a subclass of `IOException`. Catching `IOException` first would make the
more specific `catch` block unreachable, which is a compile-time error.
Rule: order `catch` blocks from most specific to least specific.

## finally block — runs no matter what

```java
try {
    Files.readString(Path.of("missing.txt"));
} catch (IOException e) {
    System.out.println("Error: " + e.getMessage());
} finally {
    System.out.println("This always runs, error or not.");
}
```

`finally` runs whether the `try` block succeeds, throws an exception, or
even returns early — the only exceptions are a JVM crash or a call to
`System.exit()`.

## Practice Program

See [`ExceptionHandlingInFileOperations.java`](../../Code/06-file-handling/03-exception-handling-in-file-operations/ExceptionHandlingInFileOperations.java)
for a runnable example covering:
- A basic try-catch around a missing file
- `try-with-resources` reading a file with `BufferedReader`
- Catching `NoSuchFileException` before the general `IOException`
- `finally` running both after an error and after a successful read