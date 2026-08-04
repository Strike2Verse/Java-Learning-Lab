# Loop Control Statements

These let you change the normal flow of a loop — either stopping it early
or skipping part of an iteration.

## break

Immediately exits the loop entirely — no more iterations happen, even if
the loop's condition was still true.

```java
for (int i = 1; i <= 10; i++) {
    if (i == 5) {
        break;
    }
    System.out.println(i);
}
// Prints: 1 2 3 4  (stops completely once i == 5)
```

## continue

Skips just the current iteration and moves on to the next one — the loop
keeps running, it only skips whatever code was left in that one pass.

```java
for (int i = 1; i <= 10; i++) {
    if (i % 2 == 0) {
        continue;
    }
    System.out.println(i);
}
// Prints: 1 3 5 7 9  (even numbers skipped, loop still finishes)
```

## Key difference

- `break` = stop the whole loop
- `continue` = skip this one round, keep looping

## Practice Program

See [`LoopControlStatements.java`](../../Code/02-control-flow/03-loop-control-statements/LoopControlStatements.java)
for a runnable example showing `break`, `continue`, and a direct
side-by-side comparison of both on the same loop and condition.