# Data Types

## Why types matter

A data type tells Java what kind of value a variable stores. It helps Java reserve suitable memory and prevents invalid operations.

## Common types

```java
String title = "Java Programming"; // text
int pages = 350;                    // whole number
double price = 499.99;              // decimal number
boolean available = true;           // true or false
char firstLetter = 'J';             // one character
```

## `String` and `char`

`String` stores text of any length and uses double quotes.

```java
String title = "XYZ";
```

`char` stores exactly one character and uses single quotes.

```java
char grade = 'A';
```

`"A"` is a `String`; `'A'` is a `char`.

## Choosing a type

- Use `int` for a whole number such as age or quantity.
- Use `double` for a value that can include decimals, such as price or temperature.
- Use `boolean` for a yes/no condition.
- Use `String` for labels, messages, and other text.

## Recap

Choose a type based on the kind of value you need to store. Java requires the value to match that type.
