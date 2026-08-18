# Stacks

A stack is a LIFO (Last-In, First-Out) data structure — like a stack of
plates: items are added to the top and removed from the top. The last
item added is the first one removed.

## Import required

```java
import java.util.Stack;
```

## Basic operations

```java
Stack<Integer> stack = new Stack<>();

stack.push(10);   // add to top
stack.push(20);
stack.push(30);

System.out.println(stack); // [10, 20, 30]

System.out.println(stack.peek());  // 30 — look at top without removing
System.out.println(stack.pop());   // 30 — removes AND returns top
System.out.println(stack);          // [10, 20]

System.out.println(stack.isEmpty()); // false
System.out.println(stack.size());     // 2
```

`peek()` is read-only; `pop()` removes and returns the top element. After
popping twice from `[1, 2, 3]` (pop returns 3, then 2), the value
remaining in the stack is `1` — not the value returned by the last pop.

## Why Stack (the class) is a bit outdated

Java's built-in `Stack` class extends `Vector` — an old, synchronized,
mostly-obsolete class from before `ArrayList` existed. It works fine for
learning, but modern code usually uses a `Deque` as a stack instead,
since it's unsynchronized (faster for typical single-threaded use) and
avoids the legacy overhead:

```java
Deque<Integer> modernStack = new ArrayDeque<>();
modernStack.push(10); // same push/pop/peek methods work
modernStack.push(20);
System.out.println(modernStack.pop()); // 20
```

## Practical use case: reversing something with a stack

```java
Stack<Character> charStack = new Stack<>();
String word = "hello";

for (char c : word.toCharArray()) {
    charStack.push(c);
}

StringBuilder reversed = new StringBuilder();
while (!charStack.isEmpty()) {
    reversed.append(charStack.pop());
}

System.out.println(reversed); // olleh
```

## Practical use case: checking balanced parentheses

```java
static boolean isBalanced(String expression) {
    Stack<Character> stack = new Stack<>();
    for (char c : expression.toCharArray()) {
        if (c == '(') {
            stack.push(c);
        } else if (c == ')') {
            if (stack.isEmpty()) return false; // closing with nothing to match
            stack.pop();
        }
    }
    return stack.isEmpty(); // true only if every '(' was matched
}
```

## Practice Program

See [`StacksDemo.java`](../../Code/10-advanced-data-structures/01-stacks/StacksDemo.java)
for a runnable example covering:
- Basic `Stack` operations (`push`, `peek`, `pop`, `isEmpty`, `size`)
- `ArrayDeque` used as a modern stack alternative
- Reversing a string using a stack
- Checking balanced parentheses using a stack