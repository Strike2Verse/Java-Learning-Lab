# Debugging Techniques (breakpoints, logging)

The final subtopic of Testing and Debugging.

## What debugging is

Debugging is the process of finding and understanding why code isn't
behaving as expected — going beyond "it's broken" to actually seeing
what's happening step by step.

## Technique 1: Breakpoints (IDE-based)

A breakpoint pauses program execution at a specific line, allowing
inspection of variable values, stepping through code line-by-line, and
seeing the actual call stack — without modifying the code.

Common breakpoint operations (VS Code, IntelliJ, most IDEs):

- **Set a breakpoint** — click in the margin next to a line number
- **Step Over** — run the current line, move to the next (don't go into
  method calls)
- **Step Into** — if the current line calls a method, jump inside it
- **Step Out** — finish the current method, return to where it was
  called from
- **Continue** — resume normal execution until the next breakpoint (or
  the program ends)
- **Watch/Inspect variables** — see live values while stepping through

Breakpoints are IDE-specific tooling, not Java syntax — there's no code
example for this; it's a skill practiced directly in an editor (e.g. VS
Code with the Java extension, using "Debug" instead of "Run").

Breakpoints require active, interactive inspection in the moment, while
logging (below) passively records what happened, reviewable at any time
after the fact.

## Technique 2: Logging — the code-based alternative

Logging is code — statements that record what's happening as the program
runs, useful for problems that are hard to reproduce interactively (e.g.
issues that only show up after running for a while, or in production
where a debugger can't be attached).

## The problem with System.out.println() for "real" logging

`println` has real limitations for serious debugging/logging: no
severity levels, no timestamps, no configurable destinations, can't be
easily turned on/off, no performance optimizations, and clutters real
program output.

## Java's built-in logging: java.util.logging

```java
import java.util.logging.Logger;
import java.util.logging.Level;

public class LoggingDemo {
    private static final Logger logger = Logger.getLogger(LoggingDemo.class.getName());

    public static void main(String[] args) {
        logger.info("Application started");
        logger.warning("This is a warning");
        logger.severe("This is a serious error");

        int result = divide(10, 2);
        logger.info("Result: " + result);
    }

    static int divide(int a, int b) {
        logger.fine("Dividing " + a + " by " + b); // fine = detailed, low-priority info
        return a / b;
    }
}
```

## Log levels (from most to least severe)

```
SEVERE > WARNING > INFO > CONFIG > FINE > FINER > FINEST
```

By default, only `INFO` and above typically print — this allows detailed
`FINE`-level logs to stay in the code permanently without cluttering
normal output, enabled only when actually debugging something.

## Why real projects often use a library instead

`java.util.logging` works, but most professional Java projects use
**SLF4J** (a logging façade) with **Logback** or **Log4j2** underneath —
more configurable, better performance, and closer to what's actually
encountered in real codebases. Worth knowing this exists, even though
`java.util.logging` is enough to understand the core concept.

## Practical debugging mindset

```java
public static int calculateDiscount(int price, int percentage) {
    logger.fine("Input - price: " + price + ", percentage: " + percentage);

    int discount = price * percentage / 100;
    logger.fine("Calculated discount: " + discount);

    int finalPrice = price - discount;
    logger.fine("Final price: " + finalPrice);

    return finalPrice;
}
```

Strategically placed logs let the exact line producing an unexpected
value be narrowed down — the same mental process as stepping through
breakpoints, just recorded instead of interactive.

## Practice Program

See [`LoggingDemo.java`](../../Code/14-testing-and-debugging/02-debugging-techniques/LoggingDemo.java)
for a runnable example covering `info`/`warning`/`severe` log levels, a
traced calculation using `fine`-level logs, and forcing all log levels
visible for demonstration purposes. Uses only the built-in
`java.util.logging` package — no external dependency needed.

### Compiling and running

```bash
cd Code/14-testing-and-debugging/02-debugging-techniques
javac LoggingDemo.java
java LoggingDemo
```