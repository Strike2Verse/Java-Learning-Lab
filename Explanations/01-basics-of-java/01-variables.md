# Variables

## What is a variable?

A variable is a named place in memory where a program stores a value. Think of it as a labelled box: the label is the variable name and the contents are its value.

```java
int age = 20;
```

Here, `int` is the type, `age` is the name, and `20` is the initial value.

## Declaring and changing a variable

You can declare a variable first and assign a value later.

```java
int score;
score = 10;
score = 25;
```

The last assignment changes the stored value to `25`.

## Naming rules

- A name can contain letters, numbers, `_`, and `$`.
- It cannot start with a number: `1score` is invalid, but `score1` is valid.
- Java is case-sensitive: `age` and `Age` are different names.
- Use meaningful camelCase names, such as `firstName` and `totalPrice`.

## Common mistake

`=` stores a value; it does not compare values. Comparison uses `==`, which is covered in Operators.

## Recap

A variable needs a type and a valid name. Its value may change while the program runs.
