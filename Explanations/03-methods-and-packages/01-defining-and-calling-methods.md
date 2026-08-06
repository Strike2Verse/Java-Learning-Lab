# Defining and Calling Methods

A method is a reusable block of code that performs a specific task. Instead
of repeating code, you write it once as a method and call it whenever
needed.

## Defining a method

```java
returnType methodName(parameters) {
    // code to execute
    return value; // only if returnType is not void
}
```

Example:

```java
static int add(int a, int b) {
    return a + b;
}
```

- `static` — belongs to the class itself (covered properly in OOP later;
  for now all our methods are `static` since we call them from `main`)
- `int` — the return type (this method gives back an `int`)
- `add` — the method name
- `(int a, int b)` — the parameters it accepts

## Calling a method

```java
int result = add(5, 3);
System.out.println(result); // 8
```

## void methods

If a method doesn't need to return anything, use `void`. No `return`
statement is needed.

```java
static void greet(String name) {
    System.out.println("Hello, " + name);
}
```

## Zero-parameter methods

A method can take no parameters at all — just leave the parentheses empty.
This is independent of whether it returns something:

```java
static void sayHello() {
    System.out.println("Hello!");
}

static int getLuckyNumber() {
    return 7;
}
```

- Parameters = what goes **in** to the method.
- Return type = what comes **out** of the method.
- A method can have any combination: zero or many parameters, and `void`
  or a real return type.

## Mismatched arguments

Java checks the number and type of arguments at compile time. Calling a
method with the wrong number of arguments (e.g. `add(5)` when `add` expects
two `int`s) causes a compile-time error — it won't even run.

## Practice Program

See [`DefiningAndCallingMethods.java`](../../Code/03-methods-and-packages/01-defining-and-calling-methods/DefiningAndCallingMethods.java)
for a runnable example covering:
- A method with parameters that returns a value
- A `void` method with a parameter
- A zero-parameter `void` method
- A zero-parameter method that still returns a value