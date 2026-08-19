# Try-with-resources / AutoCloseable

`try-with-resources` has already been used several times (File Handling,
Error Handling) with Java's built-in classes (`BufferedReader`,
`Scanner`). This covers the `AutoCloseable` interface itself, and
building a custom closable resource.

## The AutoCloseable interface

```java
public interface AutoCloseable {
    void close() throws Exception;
}
```

Just one abstract method. Anything implementing this can be used inside
`try (...)` — this is why `try-with-resources` works with so many
different classes: they all just implement this one simple interface.

## Building a custom AutoCloseable class

```java
public class DatabaseConnection implements AutoCloseable {
    private String name;

    public DatabaseConnection(String name) {
        this.name = name;
        System.out.println("Opening connection: " + name);
    }

    public void query(String sql) {
        System.out.println("Running query on " + name + ": " + sql);
    }

    @Override
    public void close() {
        System.out.println("Closing connection: " + name);
    }
}
```

```java
try (DatabaseConnection conn = new DatabaseConnection("MainDB")) {
    conn.query("SELECT * FROM users");
}
// Output:
// Opening connection: MainDB
// Running query on MainDB: SELECT * FROM users
// Closing connection: MainDB   <- happens automatically, even without an exception
```

## Multiple resources in one try-with-resources

```java
try (DatabaseConnection conn1 = new DatabaseConnection("DB1");
     DatabaseConnection conn2 = new DatabaseConnection("DB2")) {
    conn1.query("SELECT 1");
    conn2.query("SELECT 2");
}
```

Resources are closed in reverse order of declaration — `conn2` closes
first, then `conn1`, mirroring how nested resources would be manually
unwound.

## close() is called even when an exception occurs

```java
try (DatabaseConnection conn = new DatabaseConnection("MainDB")) {
    conn.query("SELECT * FROM users");
    throw new RuntimeException("Something broke!");
} catch (RuntimeException e) {
    System.out.println("Caught: " + e.getMessage());
}
// "Closing connection: MainDB" still prints, BEFORE the catch block runs
```

`close()` runs as part of exiting the `try` block, before control
transfers to the matching `catch` block — the same mechanism as `finally`
always running before an exception propagates further.

## Suppressed exceptions

If both the resource's `close()` method and the code inside `try` throw
exceptions, the exception from `try` is the "primary" one — the `close()`
exception is attached as a suppressed exception rather than replacing it:

```java
try (var conn = new DatabaseConnection("DB")) {
    throw new RuntimeException("Main error");
} catch (RuntimeException e) {
    System.out.println("Primary: " + e.getMessage());
    for (Throwable suppressed : e.getSuppressed()) {
        System.out.println("Suppressed: " + suppressed.getMessage());
    }
}
```

## Practice Program

See:
- [`DatabaseConnection.java`](../../Code/12-advanced-topics/04-try-with-resources-autocloseable/DatabaseConnection.java) —
  custom `AutoCloseable` class, with an optional flag to make `close()`
  throw (for demonstrating suppressed exceptions)
- [`TryWithResourcesDemo.java`](../../Code/12-advanced-topics/04-try-with-resources-autocloseable/TryWithResourcesDemo.java) —
  a runnable example covering basic usage, multiple resources closing in
  reverse order, `close()` firing before a `catch` block, and suppressed
  exceptions

### Compiling and running

```bash
cd Code/12-advanced-topics/04-try-with-resources-autocloseable
javac TryWithResourcesDemo.java DatabaseConnection.java
java TryWithResourcesDemo
```