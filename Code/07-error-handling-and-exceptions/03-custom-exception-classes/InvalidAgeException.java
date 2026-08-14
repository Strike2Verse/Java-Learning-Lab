// Custom CHECKED exception — extends Exception, so callers MUST catch it
// or declare it with "throws".
public class InvalidAgeException extends Exception {
    public InvalidAgeException(String message) {
        super(message); // passes the message up to Throwable
    }
}