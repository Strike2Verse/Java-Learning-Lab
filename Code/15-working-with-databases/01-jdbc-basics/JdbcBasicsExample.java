// Reference example only — java.sql (JDBC) is part of the JDK itself,
// so this compiles without an external dependency. However, actually
// RUNNING it requires a JDBC driver for the target database on the
// classpath (e.g., sqlite-jdbc for SQLite) plus a real/creatable
// database file — so this is not runnable standalone with plain
// javac/java either.
//
// Maven dependency (for SQLite):
// <dependency>
//     <groupId>org.xerial</groupId>
//     <artifactId>sqlite-jdbc</artifactId>
//     <version>3.45.2.0</version>
// </dependency>

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

public class JdbcBasicsExample {
    public static void main(String[] args) {

        String url = "jdbc:sqlite:mydatabase.db"; // connection string — varies by database type

        // ---- Step 1: connect ----
        // Connection implements AutoCloseable, just like the custom
        // DatabaseConnection example from Advanced Topics.
        try (Connection conn = DriverManager.getConnection(url)) {

            // ---- Step 2: create/query with a Statement ----
            try (Statement stmt = conn.createStatement()) {
                stmt.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)");
                stmt.execute("INSERT INTO users (name, age) VALUES ('Alice', 25)");
            }

            // ---- PreparedStatement: the safer way to insert dynamic values ----
            // Prevents SQL injection by parameterizing input, unlike
            // concatenating user input directly into a SQL string.
            String sql = "INSERT INTO users (name, age) VALUES (?, ?)"; // ? = placeholder
            try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
                pstmt.setString(1, "Bob"); // fills first ?
                pstmt.setInt(2, 30);        // fills second ?
                pstmt.executeUpdate();
            }

            // ---- Step 3: query and read results with ResultSet ----
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT * FROM users")) {

                while (rs.next()) { // moves to the next row, returns false when done
                    int id = rs.getInt("id");
                    String name = rs.getString("name");
                    int age = rs.getInt("age");
                    System.out.println(id + ": " + name + " (" + age + ")");
                }
            }

        } catch (SQLException e) {
            System.out.println("Database error: " + e.getMessage());
        }
    }
}