# Linked Lists (custom implementation)

Java's built-in `LinkedList` has been used since Data Structures — this
builds one from scratch to see what's happening under the hood.

## The building block: a Node

A linked list isn't one object — it's a chain of small objects, each
holding a value and a reference to the next one.

```java
class Node<T> {
    T data;
    Node<T> next;

    Node(T data) {
        this.data = data;
        this.next = null;
    }
}
```

## The list itself: tracking the head

The list only needs to remember one thing — the first node (`head`).
Every other node is reachable by following `next` references.

```java
public class MyLinkedList<T> {
    private Node<T> head;
    private int size;

    public MyLinkedList() {
        this.head = null;
        this.size = 0;
    }
}
```

## Adding to the end

```java
public void add(T data) {
    Node<T> newNode = new Node<>(data);
    if (head == null) {
        head = newNode; // list was empty, new node becomes head
    } else {
        Node<T> current = head;
        while (current.next != null) { // walk to the last node
            current = current.next;
        }
        current.next = newNode; // attach new node at the end
    }
    size++;
}
```

## Getting a value by index

```java
public T get(int index) {
    if (index < 0 || index >= size) {
        throw new IndexOutOfBoundsException("Index: " + index);
    }
    Node<T> current = head;
    for (int i = 0; i < index; i++) {
        current = current.next; // walk forward 'index' times
    }
    return current.data;
}
```

`get(index)` is `O(n)` — there's no direct memory indexing like an array
has, so reaching index `k` requires walking `k` steps from `head`. This is
the concrete reason `LinkedList.get()` is slower than `ArrayList.get()`
(`O(1)`), first mentioned back in Data Structures.

## Removing by value

```java
public boolean remove(T data) {
    if (head == null) return false;

    if (head.data.equals(data)) { // special case: removing the head itself
        head = head.next;
        size--;
        return true;
    }

    Node<T> current = head;
    while (current.next != null) {
        if (current.next.data.equals(data)) {
            current.next = current.next.next; // skip over the node being removed
            size--;
            return true;
        }
        current = current.next;
    }
    return false; // not found
}
```

Removing `head` is a special case because `head` is the list's entry
point (a variable on the list object itself), not something pointed to by
another node's `next` field — so it requires reassigning `head` directly
rather than modifying a predecessor's reference.

## Why this matters

This is exactly what Java's built-in `LinkedList` does internally (though
it's doubly-linked, with `prev` references too, and far more optimized).

## Printing the list nicely

```java
@Override
public String toString() {
    StringBuilder sb = new StringBuilder("[");
    Node<T> current = head;
    while (current != null) {
        sb.append(current.data);
        if (current.next != null) sb.append(", ");
        current = current.next;
    }
    sb.append("]");
    return sb.toString();
}
```

## Practice Program

See:
- [`Node.java`](../../Code/10-advanced-data-structures/03-linked-lists-custom/Node.java) — the building-block class
- [`MyLinkedList.java`](../../Code/10-advanced-data-structures/03-linked-lists-custom/MyLinkedList.java) — the custom linked list implementation
- [`LinkedListCustomDemo.java`](../../Code/10-advanced-data-structures/03-linked-lists-custom/LinkedListCustomDemo.java) —
  a runnable example covering `add`, `get` (including an out-of-bounds
  case), and `remove` (both the head special case and the general case)

### Compiling and running

```bash
cd Code/10-advanced-data-structures/03-linked-lists-custom
javac LinkedListCustomDemo.java Node.java MyLinkedList.java
java LinkedListCustomDemo
```