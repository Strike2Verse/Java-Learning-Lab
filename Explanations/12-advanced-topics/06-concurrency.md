# Concurrency (ExecutorService, CompletableFuture)

The final subtopic of Advanced Topics.

## The problem with manually managing Thread objects

Creating a `new Thread()` for every task doesn't scale — threads are
relatively expensive to create, and manually tracking/joining dozens of
them gets messy fast. `ExecutorService` solves this with a thread pool: a
managed group of reusable threads.

## Creating an ExecutorService

```java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

ExecutorService executor = Executors.newFixedThreadPool(3); // pool of 3 reusable threads
```

## Submitting tasks

```java
executor.submit(() -> {
    System.out.println("Task running on: " + Thread.currentThread().getName());
});

executor.execute(() -> System.out.println("Another task")); // similar to submit(), no return value
```

## Always shut it down

Unlike a single `Thread`, an `ExecutorService` keeps running (and keeps
the program alive) until explicitly told to stop:

```java
executor.shutdown(); // stops accepting new tasks, lets existing ones finish
```

## Getting a result back: Future

```java
import java.util.concurrent.Future;

Future<Integer> future = executor.submit(() -> {
    return 10 + 20; // task that computes a value
});

Integer result = future.get(); // blocks until the task finishes, then returns the result
System.out.println(result); // 30
```

`future.get()` throws checked exceptions (`InterruptedException`,
`ExecutionException`), so it needs handling. Blocking on `.get()`
immediately after `submit()` largely defeats the purpose of concurrency —
it makes the call effectively synchronous again.

## CompletableFuture — a more modern, flexible approach

Lets operations be chained to happen once an async task completes,
without manually blocking with `.get()`.

```java
import java.util.concurrent.CompletableFuture;

CompletableFuture<Integer> future = CompletableFuture.supplyAsync(() -> {
    return 10 + 20; // runs asynchronously
});

future.thenAccept(result -> System.out.println("Result: " + result)); // runs when the value is ready
```

## Chaining multiple steps

```java
CompletableFuture<String> chain = CompletableFuture
    .supplyAsync(() -> 10)              // start: produce a value
    .thenApply(n -> n * 2)              // transform it: 20
    .thenApply(n -> "Result: " + n);    // transform again: "Result: 20"

System.out.println(chain.get()); // Result: 20
```

This is Streams-style thinking applied to async tasks — `thenApply` is
conceptually similar to `map`: both take a wrapped value (a `Future`'s
eventual result vs. a stream element) and transform it into something
else without the caller manually unwrapping/rewrapping.

## Why this matters

This is the natural culmination of Functional Interfaces + Lambdas +
Streams + Multithreading — `CompletableFuture` uses the exact same
`Function`/`Consumer`-style lambdas learned earlier, just applied to
asynchronous computation instead of synchronous data processing.

## Practice Program

See [`ConcurrencyDemo.java`](../../Code/12-advanced-topics/06-concurrency/ConcurrencyDemo.java)
for a runnable example covering:
- `ExecutorService` with `submit`/`execute` and proper `shutdown()`
- `Future` to retrieve a task's result
- `CompletableFuture` with `thenAccept` (non-blocking reaction)
- `CompletableFuture` chaining with `thenApply`

### Compiling and running

```bash
cd Code/12-advanced-topics/06-concurrency
javac ConcurrencyDemo.java
java ConcurrencyDemo
```