# Type Casting

## What is type casting?

Type casting converts a value from one data type to another.

## Widening conversion

Java automatically converts an `int` to a `double` because the conversion is safe.

```java
int age = 20;
double ageAsDecimal = age; // 20 becomes 20.0
```

This is called widening because `double` can represent a wider range of values.

## Narrowing conversion

Converting a `double` to an `int` needs an explicit cast because information can be lost.

```java
double temperature = 36.8;
int wholeTemperature = (int) temperature; // 36
```

The `(int)` cast drops the decimal part. It does not round: `(int) 9.9` becomes `9`.

## When to be careful

Use narrowing casts only when losing the decimal part is acceptable. For prices, converting directly to `int` is often not suitable.

## Recap

`int` to `double` is automatic. `double` to `int` requires `(int)` and removes the fractional part.
