// This example uses only the built-in java.util.logging package — no
// external dependency needed, unlike the reference-only examples in
// earlier subtopics.

import java.util.logging.Level;
import java.util.logging.Logger;

public class LoggingDemo {
    private static final Logger logger = Logger.getLogger(LoggingDemo.class.getName());

    public static void main(String[] args) {

        // ---- basic log levels ----
        logger.info("Application started");
        logger.warning("This is a warning");
        logger.severe("This is a serious error");

        System.out.println("--------------------");

        // ---- using logging to trace a calculation step by step ----
        int result = calculateDiscount(200, 15);
        logger.info("Final result: " + result);

        System.out.println("--------------------");

        // ---- fine-level logs: usually hidden by default ----
        // By default, only INFO and above typically print — FINE-level
        // logs can stay in the code permanently without cluttering
        // normal output, and be enabled only when actually debugging.
        System.out.println("Note: FINE-level logs below may not print by default,");
        System.out.println("depending on the logger's configured level.");
        logger.setLevel(Level.ALL); // force-enable all levels for this demo
        logger.fine("This is a FINE-level (detailed, low-priority) log message");

        divide(10, 2);
    }

    // Demonstrates the "debugging mindset": strategically placed logs
    // narrow down exactly which step produced an unexpected value.
    static int calculateDiscount(int price, int percentage) {
        logger.fine("Input - price: " + price + ", percentage: " + percentage);

        int discount = price * percentage / 100;
        logger.fine("Calculated discount: " + discount);

        int finalPrice = price - discount;
        logger.fine("Final price: " + finalPrice);

        return finalPrice;
    }

    static int divide(int a, int b) {
        logger.fine("Dividing " + a + " by " + b);
        return a / b;
    }
}