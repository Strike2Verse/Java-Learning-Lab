# Lambda Expressions (intro)

A lambda is a compact way to write a method without a name — mainly used
when you need to pass a small piece of behavior (a function) as if it were
a value, often to another method.

This is just an introduction — lambdas are covered in more depth later in
Advanced Topics.

## Basic syntax

```java
(parameters) -> { code }
```

## Functional interfaces

Lambdas only work with **functional interfaces** — interfaces with exactly
one abstract method. Java has several built-in ones in
`java.util.function`.

### Runnable — takes nothing, returns nothing

```java
Runnable task = () -> System.out.println("Running the task!");
task.run();
```

Compare with the traditional (anonymous class) way, which does the same
thing but with far more code:

```java
Runnable task = new Runnable() {
    public void run() {
        System.out.println("Running the task!");
    }
};
```

### Comparator — lambda with parameters

```java
Integer[] nums = {5, 2, 8, 1};
Arrays.sort(nums, (a, b) -> a - b); // ascending order
```

Here, `(a, b) -> a - b` replaces writing a whole `Comparator` class just to
define one comparison rule.

### Function — lambda with a return value

```java
Function<Integer, Integer> square = x -> x * x;
System.out.println(square.apply(5)); // 25
```

If the lambda body is a single expression, `{ }` and `return` are not
needed — the value is returned implicitly. If the body were a full block
(`{ return x * x; }`), `return` would be required.

## Practice Program

See [`LambdaExpressionsIntro.java`](../../Code/03-methods-and-packages/03-lambda-expressions-intro/LambdaExpressionsIntro.java)
for a runnable example covering:
- A `Runnable` lambda
- A `Comparator` lambda used to sort ascending and descending
- `Function` lambdas that take a value and return a value