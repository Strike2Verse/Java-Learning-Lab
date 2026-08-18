# Queues / Deques

A queue is a FIFO (First-In, First-Out) data structure — like a line at a
store: the first person in line is the first one served. Elements are
added to the back and removed from the front.

## The Queue interface

```java
import java.util.Queue;
import java.util.LinkedList;

Queue<Integer> queue = new LinkedList<>(); // LinkedList implements Queue too

queue.offer(10); // add to the back (preferred over add())
queue.offer(20);
queue.offer(30);

System.out.println(queue);          // [10, 20, 30]
System.out.println(queue.peek());   // 10 — front, without removing
System.out.println(queue.poll());   // 10 — removes AND returns front (preferred over remove())
System.out.println(queue);          // [20, 30]
```

## Why offer/poll over add/remove

Both pairs do the same job, but `offer`/`poll` return a special value
(`false`/`null`) on failure instead of throwing an exception — generally
safer/preferred for typical queue usage.

## What a Deque is

A `Deque` (Double-Ended Queue) allows adding/removing from both ends — it
can act as a queue, a stack, or both.

```java
import java.util.ArrayDeque;
import java.util.Deque;

Deque<Integer> deque = new ArrayDeque<>();

deque.addFirst(10); // add to front
deque.addLast(20);  // add to back
deque.addFirst(5);

System.out.println(deque); // [5, 10, 20]

System.out.println(deque.peekFirst()); // 5
System.out.println(deque.peekLast());  // 20

deque.pollFirst(); // removes 5
deque.pollLast();  // removes 20
System.out.println(deque); // [10]
```

## Using Deque as both a Queue and a Stack

```java
Deque<Integer> asQueue = new ArrayDeque<>();
asQueue.offer(1);       // add to back
asQueue.offer(2);
System.out.println(asQueue.poll()); // 1 — FIFO behavior

Deque<Integer> asStack = new ArrayDeque<>();
asStack.push(1);        // add to front
asStack.push(2);
System.out.println(asStack.pop()); // 2 — LIFO behavior
```

`push()`/`pop()` operate on the front (stack/LIFO behavior);
`offer()`/`poll()` operate front/back respectively (queue/FIFO behavior).
This is why `ArrayDeque` is the modern go-to for both stack and queue
needs — one class, two behaviors, depending on which methods are used.

## Practical use case: processing tasks in order

```java
Queue<String> taskQueue = new LinkedList<>();
taskQueue.offer("Send email");
taskQueue.offer("Generate report");
taskQueue.offer("Backup database");

while (!taskQueue.isEmpty()) {
    String task = taskQueue.poll();
    System.out.println("Processing: " + task);
}
```

## Practice Program

See [`QueuesDequesDemo.java`](../../Code/10-advanced-data-structures/02-queues-deques/QueuesDequesDemo.java)
for a runnable example covering:
- Basic `Queue` operations (`offer`, `peek`, `poll`)
- `Deque` access from both ends (`addFirst`/`addLast`,
  `peekFirst`/`peekLast`, `pollFirst`/`pollLast`)
- `Deque` used as a `Queue` (FIFO) and as a `Stack` (LIFO)
- Processing a task queue in order