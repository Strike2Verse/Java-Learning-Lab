# Lambda Expressions & Functional Interfaces

An intro to lambdas was covered in Methods and Packages — this goes
deeper into functional interfaces and Java's built-in ones.

## Recap: what makes an interface "functional"

An interface with exactly one abstract method. `@FunctionalInterface` is
optional but recommended — it makes Java enforce the "exactly one
abstract method" rule at compile time.

```java
@FunctionalInterface
interface Greeting {
    void greet(String name);
}
```

```java
Greeting greeting = name -> System.out.println("Hello, " + name);
greeting.greet("Alice"); // Hello, Alice
```

## Java's built-in functional interfaces (java.util.function)

**Function<T, R>** — takes a `T`, returns an `R`

```java
Function<Integer, Integer> square = x -> x * x;
System.out.println(square.apply(5)); // 25
```

**Predicate<T>** — takes a `T`, returns `boolean` (a yes/no test)

```java
Predicate<Integer> isEven = x -> x % 2 == 0;
System.out.println(isEven.test(4)); // true
```

**Consumer<T>** — takes a `T`, returns nothing

```java
Consumer<String> printer = s -> System.out.println("Got: " + s);
printer.accept("hello"); // Got: hello
```

**Supplier<T>** — takes nothing, returns a `T`

```java
Supplier<String> greetingSupplier = () -> "Hello there!";
System.out.println(greetingSupplier.get()); // Hello there!
```

**BiFunction<T, U, R>** — takes two inputs, returns a result

```java
BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;
System.out.println(add.apply(3, 4)); // 7
```

## Combining functional interfaces

Several have built-in default methods for chaining:

```java
Function<Integer, Integer> square = x -> x * x;
Function<Integer, Integer> addOne = x -> x + 1;

Function<Integer, Integer> combined = square.andThen(addOne); // square first, then add one
System.out.println(combined.apply(3)); // 9, then +1 = 10

Predicate<Integer> isEven = x -> x % 2 == 0;
Predicate<Integer> isPositive = x -> x > 0;
Predicate<Integer> both = isEven.and(isPositive); // combines two Predicates
System.out.println(both.test(4));  // true
System.out.println(both.test(-4)); // false
```

## Using these with Streams

```java
List<Integer> numbers = List.of(1, 2, 3, 4, 5, 6);

Predicate<Integer> isEven = x -> x % 2 == 0;
List<Integer> evens = numbers.stream()
    .filter(isEven) // filter() literally expects a Predicate<T>
    .collect(Collectors.toList());
```

This is the reason Streams work the way they do — `filter` takes a
`Predicate`, `map` takes a `Function`, `forEach` takes a `Consumer`.
Understanding functional interfaces is what makes the Streams API fully
click.

## Custom functional interfaces

```java
@FunctionalInterface
interface Calculator {
    int calculate(int a, int b);
}
```

```java
Calculator add = (a, b) -> a + b;
Calculator multiply = (a, b) -> a * b;
System.out.println(add.calculate(3, 4));       // 7
System.out.println(multiply.calculate(3, 4));  // 12
```

`@FunctionalInterface` is purely a compile-time enforcement/documentation
tool (same category as `@Override`), catching violations of the
"exactly one abstract method" rule early, with zero effect on runtime
behavior.

## Practice Program

See:
- [`Greeting.java`](../../Code/12-advanced-topics/03-lambda-functional-interfaces/Greeting.java) — a simple custom functional interface
- [`Calculator.java`](../../Code/12-advanced-topics/03-lambda-functional-interfaces/Calculator.java) — a custom functional interface with two parameters
- [`LambdaFunctionalInterfacesDemo.java`](../../Code/12-advanced-topics/03-lambda-functional-interfaces/LambdaFunctionalInterfacesDemo.java) —
  a runnable example covering all the built-in functional interfaces,
  chaining with `andThen`/`and`, Stream integration, and both custom
  interfaces

### Compiling and running

```bash
cd Code/12-advanced-topics/03-lambda-functional-interfaces
javac LambdaFunctionalInterfacesDemo.java Greeting.java Calculator.java
java LambdaFunctionalInterfacesDemo
```