# Custom Exception Classes

Sometimes Java's built-in exceptions (`IllegalArgumentException`,
`IOException`, etc.) don't precisely describe a program's specific
problem. Custom exceptions allow meaningful, domain-specific error types
— e.g., `InsufficientFundsException` for a banking app, rather than a
generic `RuntimeException`.

## Creating a custom unchecked exception

Extend `RuntimeException` — no `throws` declaration required for callers:

```java
public class InsufficientFundsException extends RuntimeException {
    public InsufficientFundsException(String message) {
        super(message); // passes the message up to Throwable
    }
}
```

## Creating a custom checked exception

Extend `Exception` instead — callers must handle it or declare it:

```java
public class InvalidAgeException extends Exception {
    public InvalidAgeException(String message) {
        super(message);
    }
}
```

## Using a custom unchecked exception

```java
static void withdraw(double balance, double amount) {
    if (amount > balance) {
        throw new InsufficientFundsException("Cannot withdraw $" + amount + ", balance is only $" + balance);
    }
    System.out.println("Withdrew $" + amount);
}
```

## Using a custom checked exception

```java
static void setAge(int age) throws InvalidAgeException {
    if (age < 0 || age > 150) {
        throw new InvalidAgeException("Age must be between 0 and 150, got: " + age);
    }
    System.out.println("Age set to: " + age);
}
```

## Catching custom exceptions

Works exactly like any other exception:

```java
try {
    setAge(-5);
} catch (InvalidAgeException e) {
    System.out.println("Invalid age: " + e.getMessage());
}
```

## Adding extra fields to a custom exception

Custom exceptions are regular classes — fields beyond just the message can
be added when useful:

```java
public class InsufficientFundsException extends RuntimeException {
    private final double shortfall;

    public InsufficientFundsException(String message, double shortfall) {
        super(message);
        this.shortfall = shortfall;
    }

    public double getShortfall() {
        return shortfall;
    }
}
```

This lets calling code react programmatically (e.g., `e.getShortfall()`),
not just display a message. `super(message)` passes the detail string up
to `Throwable`, which is where `getMessage()` and `printStackTrace()` are
actually defined — this is true for both checked and unchecked custom
exceptions, since both `Exception` and `RuntimeException` ultimately
extend `Throwable`.

## Practice Program

See:
- [`InsufficientFundsException.java`](../../Code/07-error-handling-and-exceptions/03-custom-exception-classes/InsufficientFundsException.java) — custom unchecked exception with an extra field
- [`InvalidAgeException.java`](../../Code/07-error-handling-and-exceptions/03-custom-exception-classes/InvalidAgeException.java) — custom checked exception
- [`CustomExceptionsDemo.java`](../../Code/07-error-handling-and-exceptions/03-custom-exception-classes/CustomExceptionsDemo.java) — runnable example using both, including reading the extra `shortfall` field

### Compiling and running

Since this example spans multiple files, compile them together:

```bash
cd Code/07-error-handling-and-exceptions/03-custom-exception-classes
javac CustomExceptionsDemo.java InsufficientFundsException.java InvalidAgeException.java
java CustomExceptionsDemo
```