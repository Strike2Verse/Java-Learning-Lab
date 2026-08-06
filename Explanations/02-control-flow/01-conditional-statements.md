# Conditional Statements

Conditional statements let a program make decisions — running different code
depending on whether something is true or false.

## if / else if / else

```java
if (condition1) {
    // runs if condition1 is true
} else if (condition2) {
    // runs if condition1 is false AND condition2 is true
} else {
    // runs if none of the above are true
}
```

- Conditions are checked top to bottom.
- The moment one condition is true, that block runs and the rest are skipped.
- `else` is the fallback — it runs only if nothing above matched.

## switch

Useful when checking one variable against many exact values — cleaner than a
long `if / else if` chain.

### Classic syntax

```java
switch (value) {
    case 1:
        // code
        break;
    case 2:
        // code
        break;
    default:
        // code if nothing matched
}
```

- `break` stops execution from falling through into the next case.
- Without `break`, Java keeps running every case below the matched one
  (called "fall-through") until it hits a `break` or reaches the end.
- `default` behaves like `else` — it runs if nothing matches.

### Arrow syntax (Java 14+, preferred)

```java
switch (value) {
    case 1 -> // code
    case 2 -> // code
    default -> // code if nothing matched
}
```

- No `break` needed — each case only runs its own code, automatically.
- Removes the risk of accidentally forgetting a `break` and causing
  fall-through.
- This is the modern, preferred style, and the one used in the practice
  program below.

- `switch` works with `int`, `char`, `String`, `enum`, and a few wrapper
  types — not just numbers.

## Practice Program

See [`ConditionalStatements.java`](../../Code/02-control-flow/01-conditional-statements/ConditionalStatements.java)
for a runnable example covering both:
- A grade calculator using `if / else if / else`
- A day-name lookup using `switch`