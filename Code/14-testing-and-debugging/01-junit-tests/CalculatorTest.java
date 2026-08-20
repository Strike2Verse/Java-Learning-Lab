// Reference example only — NOT compilable/runnable with plain javac/java.
// Requires the junit-jupiter dependency to be added via Maven/Gradle
// first (see Topic 9: Third-party Dependencies), and is normally run via
// "mvn test" or "gradle test", not with plain javac/java.
//
// Maven dependency:
// <dependency>
//     <groupId>org.junit.jupiter</groupId>
//     <artifactId>junit-jupiter</artifactId>
//     <version>5.10.2</version>
//     <scope>test</scope>
// </dependency>

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CalculatorTest {

    Calculator calc;

    // Runs before EVERY test method — guarantees a fresh, isolated
    // instance for each test, and avoids repeating setup code.
    @BeforeEach
    void setUp() {
        calc = new Calculator();
    }

    @Test
    void testAdd() {
        int result = calc.add(2, 3);
        assertEquals(5, result); // "expected" comes first, then "actual"
    }

    @Test
    void testAddWithNegativeNumbers() {
        assertEquals(-3, calc.add(-5, 2));
    }

    @Test
    void testAddResultIsPositive() {
        assertTrue(calc.add(2, 3) > 0);
    }

    @Test
    void testAddNegativeResultIsNotPositive() {
        assertFalse(calc.add(-5, 2) > 0);
    }

    @Test
    void testCalculatorInstanceIsNotNull() {
        assertNotNull(calc);
    }

    @Test
    void testDivide() {
        assertEquals(5, calc.divide(10, 2));
    }

    @Test
    void testDivideByZeroThrowsException() {
        // Verifies that dividing by zero throws the expected exception —
        // something a regular assertEquals has no way to express.
        assertThrows(ArithmeticException.class, () -> calc.divide(10, 0));
    }
}