// Reference example only — requires the mysql-connector-j dependency
// (via Maven/Gradle) AND a running MySQL server to actually connect and
// run. Not runnable standalone with plain javac/java.
//
// Maven dependency:
// <dependency>
//     <groupId>com.mysql</groupId>
//     <artifactId>mysql-connector-j</artifactId>
//     <version>8.3.0</version>
// </dependency>

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class MySQLExample {

    // host:port/database_name — different URL structure than SQLite's file path
    private static final String URL = "jdbc:mysql://localhost:3306/mydatabase";
    private static final String USERNAME = "root";
    private static final String PASSWORD = "yourpassword";

    public static void main(String[] args) {
        createTable();
        insertUser("Alice", "alice@example.com");
        printAllUsers();
    }

    static void createTable() {
        // Same JDBC interfaces as SQLite (Connection, Statement) — only
        // the connection setup differs, since the driver implements
        // these interfaces differently underneath.
        try (Connection conn = DriverManager.getConnection(URL, USERNAME, PASSWORD);
             Statement stmt = conn.createStatement()) {

            stmt.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(150)
                )
                """);

        } catch (SQLException e) {
            handleSqlException(e);
        }
    }

    static void insertUser(String name, String email) {
        String sql = "INSERT INTO users (name, email) VALUES (?, ?)";

        try (Connection conn = DriverManager.getConnection(URL, USERNAME, PASSWORD);
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, name);
            pstmt.setString(2, email);
            pstmt.executeUpdate();

        } catch (SQLException e) {
            handleSqlException(e);
        }
    }

    static void printAllUsers() {
        String sql = "SELECT * FROM users";

        try (Connection conn = DriverManager.getConnection(URL, USERNAME, PASSWORD);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                System.out.println(rs.getInt("id") + ": " + rs.getString("name")
                    + " (" + rs.getString("email") + ")");
            }

        } catch (SQLException e) {
            handleSqlException(e);
        }
    }

    // Handling connection failures gracefully with specific messages.
    static void handleSqlException(SQLException e) {
        if (e.getMessage().contains("Access denied")) {
            System.out.println("Invalid username or password.");
        } else if (e.getMessage().contains("Unknown database")) {
            System.out.println("Database does not exist.");
        } else {
            System.out.println("Database error: " + e.getMessage());
        }
    }
}