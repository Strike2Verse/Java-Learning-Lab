# Method Overloading, Varargs, and Return Values

## Method Overloading

You can have multiple methods with the same name, as long as their
parameters differ (different number, type, or order). Java picks the
correct one based on what you pass in.

```java
static int add(int a, int b) {
    return a + b;
}

static double add(double a, double b) {
    return a + b;
}

static int add(int a, int b, int c) {
    return a + b + c;
}
```

- Overloads are distinguished by their **signature** (name + parameter
  types/order) — the return type alone is not enough to tell two methods
  apart, so two methods with identical parameters but different return
  types will not compile.

## Varargs (variable-length arguments)

Lets a method accept any number of arguments of a type, using `...`.

```java
static int sum(int... numbers) {
    int total = 0;
    for (int num : numbers) {
        total += num;
    }
    return total;
}
```

- Inside the method, the varargs parameter is treated exactly like an
  array (`int[]`), which is why it can be looped over with enhanced `for`.
- A method can combine a regular parameter with a varargs parameter, but
  the varargs parameter must always come **last**:
  ```java
  static void printAll(String label, int... nums) { ... }
  ```

## Multiple Return Values (workaround)

Java methods can only return one value directly. To return multiple
values, a common approach (before we cover objects properly in OOP) is to
return an array:

```java
static int[] minAndMax(int[] numbers) {
    int min = numbers[0];
    int max = numbers[0];
    for (int num : numbers) {
        if (num < min) min = num;
        if (num > max) max = num;
    }
    return new int[] { min, max };
}
```

## Practice Program

See [`MethodOverloadingVarargsReturns.java`](../../Code/03-methods-and-packages/02-overloading-varargs-returns/MethodOverloadingVarargsReturns.java)
for a runnable example covering:
- Three overloaded `add` methods
- A varargs `sum` method
- A method combining a regular parameter with varargs
- Returning multiple values (min and max) via an array