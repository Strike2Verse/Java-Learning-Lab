public class DatabaseConnection implements AutoCloseable {
    private String name;
    private boolean failOnClose;

    public DatabaseConnection(String name) {
        this(name, false);
    }

    public DatabaseConnection(String name, boolean failOnClose) {
        this.name = name;
        this.failOnClose = failOnClose;
        System.out.println("Opening connection: " + name);
    }

    public void query(String sql) {
        System.out.println("Running query on " + name + ": " + sql);
    }

    @Override
    public void close() {
        System.out.println("Closing connection: " + name);
        if (failOnClose) {
            throw new RuntimeException("Failed to close " + name + " cleanly");
        }
    }
}