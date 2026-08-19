# Multithreading (Thread, Runnable)

## What a thread is

A thread is an independent path of execution within a program. Every
Java program has at least one thread automatically — the "main" thread,
which runs `main()`. Multithreading means running multiple paths of
execution concurrently.

## Creating a thread: extending Thread

```java
public class MyThread extends Thread {
    @Override
    public void run() {
        for (int i = 1; i <= 5; i++) {
            System.out.println(Thread.currentThread().getName() + ": " + i);
        }
    }
}
```

```java
MyThread thread = new MyThread();
thread.start(); // starts a NEW thread — do NOT call run() directly, that just runs it normally on the current thread!
```

## Creating a thread: implementing Runnable (preferred)

Since Java only allows single inheritance (Abstraction), extending
`Thread` uses up the one `extends` slot. Implementing `Runnable` instead
avoids that limitation:

```java
public class MyTask implements Runnable {
    @Override
    public void run() {
        for (int i = 1; i <= 5; i++) {
            System.out.println(Thread.currentThread().getName() + ": " + i);
        }
    }
}
```

```java
Thread thread = new Thread(new MyTask());
thread.start();
```

## Using a lambda instead (Runnable is a functional interface!)

```java
Thread thread = new Thread(() -> {
    for (int i = 1; i <= 5; i++) {
        System.out.println(Thread.currentThread().getName() + ": " + i);
    }
});
thread.start();
```

## start() vs run() — a critical distinction

- `start()` — creates a new thread, then calls `run()` on it (runs
  concurrently).
- `run()` — just a normal method call, runs on the current thread (no
  concurrency at all).

## The problem: threads run unpredictably interleaved

```java
Thread t1 = new Thread(() -> {
    for (int i = 1; i <= 3; i++) System.out.println("Thread A: " + i);
});
Thread t2 = new Thread(() -> {
    for (int i = 1; i <= 3; i++) System.out.println("Thread B: " + i);
});
t1.start();
t2.start();
```

The output order between "Thread A" and "Thread B" lines is not
guaranteed — the OS scheduler decides, and it can vary between runs. This
unpredictability is exactly why Concurrency (next subtopic) needs
careful tools to manage shared data safely.

## Waiting for a thread to finish: join()

```java
Thread thread = new Thread(() -> System.out.println("Working..."));
thread.start();
thread.join(); // main thread waits here until 'thread' finishes
System.out.println("Done!"); // guaranteed to print AFTER "Working..."
```

`join()` is needed precisely when subsequent code depends on a thread's
work being complete first.

## sleep() — pausing a thread temporarily

```java
Thread.sleep(1000); // pauses the CURRENT thread for 1000ms (1 second)
```

`sleep()` throws a checked `InterruptedException`, so it needs a
`try-catch` (or a `throws` declaration).

## Practice Program

See [`MultithreadingDemo.java`](../../Code/12-advanced-topics/05-multithreading/MultithreadingDemo.java)
for a runnable example covering:
- Creating and starting a thread via a `Runnable` lambda
- The difference between calling `.run()` directly vs `.start()`
- Two threads running concurrently with unpredictable interleaving
- `join()` to wait for threads to finish
- `sleep()` to pause the current thread