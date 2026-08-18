// Reference example only — NOT compilable/runnable with plain javac/java.
// Requires the commons-lang3 dependency to be added via Maven/Gradle first
// (see Topic 9: Third-party Dependencies).
//
// Maven dependency:
// <dependency>
//     <groupId>org.apache.commons</groupId>
//     <artifactId>commons-lang3</artifactId>
//     <version>3.14.0</version>
// </dependency>

import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.RandomStringUtils;
import org.apache.commons.lang3.StringUtils;

public class ApacheCommonsExample {
    public static void main(String[] args) {

        // ---- StringUtils: null-safe string operations ----
        String value = null;

        // Regular Java: value.isEmpty() would throw NullPointerException!
        System.out.println("isEmpty(null): " + StringUtils.isEmpty(value));   // true — handles null safely
        System.out.println("isBlank(null): " + StringUtils.isBlank(value));    // true — also handles null

        System.out.println("isEmpty(\"\"): " + StringUtils.isEmpty(""));        // true
        System.out.println("isEmpty(\"  \"): " + StringUtils.isEmpty("  "));      // false — has spaces
        System.out.println("isBlank(\"  \"): " + StringUtils.isBlank("  "));       // true — blank = empty or whitespace

        System.out.println("--------------------");

        // ---- other handy StringUtils methods ----
        System.out.println("capitalize(\"hello\"): " + StringUtils.capitalize("hello"));      // Hello
        System.out.println("reverse(\"hello\"): " + StringUtils.reverse("hello"));           // olleh
        System.out.println("repeat(\"ab\", 3): " + StringUtils.repeat("ab", 3));             // ababab
        System.out.println("trim(null): " + StringUtils.trim(null));                   // null (safe — doesn't throw)
        System.out.println("defaultIfBlank(null, \"N/A\"): " + StringUtils.defaultIfBlank(null, "N/A")); // N/A

        System.out.println("--------------------");

        // ---- RandomStringUtils: generating random strings ----
        String randomAlpha = RandomStringUtils.randomAlphabetic(8);  // e.g. "XjKpQzRt"
        String randomNumeric = RandomStringUtils.randomNumeric(6);    // e.g. "482913"
        System.out.println("Random alphabetic (8): " + randomAlpha);
        System.out.println("Random numeric (6): " + randomNumeric);

        System.out.println("--------------------");

        // ---- ArrayUtils: array helpers Java doesn't provide natively ----
        int[] numbers = { 1, 2, 3 };
        int[] withNewElement = ArrayUtils.add(numbers, 4); // arrays are fixed-size, remember!
        boolean contains = ArrayUtils.contains(numbers, 2);
        int[] reversed = ArrayUtils.clone(numbers);
        ArrayUtils.reverse(reversed);

        System.out.println("Original: " + ArrayUtils.toString(numbers));
        System.out.println("After add(4): " + ArrayUtils.toString(withNewElement));
        System.out.println("contains(2): " + contains);
        System.out.println("Reversed: " + ArrayUtils.toString(reversed));
    }
}