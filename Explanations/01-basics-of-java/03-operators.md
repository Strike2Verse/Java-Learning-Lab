# Operators

## What are operators?

Operators are symbols that perform an action on values or variables.

## Arithmetic operators

```java
int a = 10;
int b = 3;

int sum = a + b;        // 13
int difference = a - b; // 7
int product = a * b;    // 30
int quotient = a / b;   // 3
int remainder = a % b;  // 1
```

When both values are `int`, division removes the decimal part. For example, `10 / 3` is `3`.

## Comparison operators

Comparison operators return a `boolean`: `true` or `false`.

```java
int age = 20;
boolean adult = age >= 18; // true
boolean exactAge = age == 18; // false
boolean notEighteen = age != 18; // true
```

Useful comparisons are `>`, `<`, `>=`, `<=`, `==`, and `!=`.

## Assignment versus comparison

```java
int score = 10;       // = assigns 10 to score
boolean passed = score == 10; // == compares values
```

Using `=` instead of `==` in a comparison is a very common beginner mistake.

## Recap

Arithmetic operators calculate values. Comparison operators answer a true/false question.
