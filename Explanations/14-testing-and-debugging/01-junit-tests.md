# Writing Unit Tests with JUnit

## Why unit tests matter

Code has been verified so far by running it and reading console output
manually. That doesn't scale — as a codebase grows, manually re-checking
everything after every change becomes impossible. Unit tests automate
this: code is written that checks other code, and can be re-run
instantly, anytime.

## Dependency (for reference)

```xml
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
    <version>5.10.2</version>
    <scope>test</scope>
</dependency>
```

## The class under test

```java
public class Calculator {
    public int add(int a, int b) {
        return a + b;
    }

    public int divide(int a, int b) {
        if (b == 0) {
            throw new ArithmeticException("Cannot divide by zero");
        }
        return a / b;
    }
}
```

## Writing a basic test

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CalculatorTest {

    @Test
    void testAdd() {
        Calculator calc = new Calculator();
        int result = calc.add(2, 3);
        assertEquals(5, result); // "expected" comes first, then "actual"
    }
}
```

`@Test` marks a method as a test case. `assertEquals(expected, actual)`
fails the test if the two values don't match.

## Common assertions

```java
assertEquals(5, calc.add(2, 3));
assertTrue(calc.add(2, 3) > 0);
assertFalse(calc.add(-5, 2) > 0);
assertNull(someObject);
assertNotNull(calc);

assertThrows(ArithmeticException.class, () -> calc.divide(10, 0)); // testing that an exception IS thrown
```

`assertThrows` specifically verifies that code throws an expected
exception type — something `assertEquals` can't express, since it only
compares values.

## @BeforeEach — setup code that runs before every test

```java
class CalculatorTest {
    Calculator calc;

    @BeforeEach
    void setUp() {
        calc = new Calculator(); // fresh instance before EVERY test method
    }

    @Test
    void testAdd() {
        assertEquals(5, calc.add(2, 3));
    }

    @Test
    void testDivide() {
        assertEquals(5, calc.divide(10, 2));
    }
}
```

`@BeforeEach` avoids repeating setup code across every test method, and
guarantees test isolation — each test gets a genuinely fresh object,
unaffected by what a previous test did to it.

## Multiple tests, one class = a test suite for that class

Convention: one test class per class being tested, named `ClassNameTest`.
Each test method should test one specific behavior, with a clear,
descriptive name (`testDivideByZeroThrowsException`, not `test3`).

## Reference Files

See:
- [`Calculator.java`](../../Code/14-testing-and-debugging/01-junit-tests/Calculator.java) — the class under test
- [`CalculatorTest.java`](../../Code/14-testing-and-debugging/01-junit-tests/CalculatorTest.java) —
  a reference test suite covering `@Test`, `@BeforeEach`, and multiple
  assertion types including `assertThrows`

These are reference examples — running them requires the JUnit
dependency configured via Maven/Gradle, and are normally executed with
`mvn test` / `gradle test`, not plain `javac`/`java`.