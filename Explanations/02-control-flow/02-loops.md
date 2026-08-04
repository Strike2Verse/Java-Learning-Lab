# Loops

Loops let you repeat a block of code multiple times without writing it out
again and again.

## for loop

Best when you know exactly how many times you want to repeat something.

```java
for (int i = 1; i <= 5; i++) {
    System.out.println("Count: " + i);
}
```

- `int i = 1` — runs once, before the loop starts
- `i <= 5` — checked before every iteration; loop stops when this is false
- `i++` — runs after every iteration

## while loop

Best when you don't know exactly how many times, but you have a condition
to check before each run.

```java
int count = 1;
while (count <= 5) {
    System.out.println("Count: " + count);
    count++;
}
```

- The condition is checked **before** the body runs.
- If the condition is false from the start, the loop body never runs at all.

## do-while loop

Same as `while`, but the condition is checked **after** the body runs — so
it always runs at least once, even if the condition starts out false.

```java
int count = 1;
do {
    System.out.println("Count: " + count);
    count++;
} while (count <= 5);
```

## Enhanced for loop (for-each)

Used to loop through every element in an array or collection without
needing to manage an index.

```java
int[] numbers = {10, 20, 30};
for (int num : numbers) {
    System.out.println(num);
}
```

- Prefer this when you just need to read/use every element and don't care
  about its position.
- Use a regular `for` loop instead when you need the index, need to loop
  backwards, skip elements, or modify the array while iterating.

## Practice Program

See [`Loops.java`](../../Code/02-control-flow/02-loops/Loops.java) for a
runnable example covering all four loop types, plus a side-by-side
comparison of the regular `for` loop (with index) and the enhanced `for`
loop.