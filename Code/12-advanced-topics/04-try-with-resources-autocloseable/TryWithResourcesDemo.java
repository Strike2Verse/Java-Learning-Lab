public class TryWithResourcesDemo {
    public static void main(String[] args) {

        // ---- basic try-with-resources: close() called automatically ----
        System.out.println("-- basic usage --");
        try (DatabaseConnection conn = new DatabaseConnection("MainDB")) {
            conn.query("SELECT * FROM users");
        }
        // "Closing connection: MainDB" happens automatically, even without an exception

        System.out.println("--------------------");

        // ---- multiple resources: closed in REVERSE order of declaration ----
        System.out.println("-- multiple resources --");
        try (DatabaseConnection conn1 = new DatabaseConnection("DB1");
             DatabaseConnection conn2 = new DatabaseConnection("DB2")) {
            conn1.query("SELECT 1");
            conn2.query("SELECT 2");
        }
        // conn2 closes first, then conn1

        System.out.println("--------------------");

        // ---- close() still runs even when an exception occurs ----
        System.out.println("-- exception inside try --");
        try (DatabaseConnection conn = new DatabaseConnection("MainDB")) {
            conn.query("SELECT * FROM users");
            throw new RuntimeException("Something broke!");
        } catch (RuntimeException e) {
            System.out.println("Caught: " + e.getMessage());
        }
        // "Closing connection: MainDB" prints BEFORE the catch block runs

        System.out.println("--------------------");

        // ---- suppressed exceptions: both try body AND close() throw ----
        System.out.println("-- suppressed exceptions --");
        try (DatabaseConnection conn = new DatabaseConnection("FlakyDB", true)) {
            throw new RuntimeException("Main error");
        } catch (RuntimeException e) {
            System.out.println("Primary: " + e.getMessage());
            for (Throwable suppressed : e.getSuppressed()) {
                System.out.println("Suppressed: " + suppressed.getMessage());
            }
        }
    }
}