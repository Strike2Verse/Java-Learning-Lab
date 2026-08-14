// Custom UNCHECKED exception — extends RuntimeException, so callers are
// not forced to catch or declare it.
public class InsufficientFundsException extends RuntimeException {

    // Extra field beyond just the message — a custom exception is a
    // regular class, so it can carry additional context data.
    private final double shortfall;

    public InsufficientFundsException(String message, double shortfall) {
        super(message); // passes the message up to Throwable
        this.shortfall = shortfall;
    }

    public double getShortfall() {
        return shortfall;
    }
}