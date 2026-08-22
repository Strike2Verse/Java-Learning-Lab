// Reference example only — java.sql (JDBC) is part of the JDK, but
// actually connecting to SQLite requires the sqlite-jdbc driver on the
// classpath (added via Maven/Gradle). Not runnable standalone with
// plain javac/java.
//
// Maven dependency:
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

public class SqliteExample {

    private static final String URL = "jdbc:sqlite:students.db"; // creates the file if it doesn't exist

    public static void main(String[] args) {

        createTableAndInsert();
        printAllStudents();
        updateGrade("Alice", 95.0);
        printAllStudents();
    }

    static void createTableAndInsert() {
        try (Connection conn = DriverManager.getConnection(URL);
             Statement stmt = conn.createStatement()) {

            // Text block (from String Manipulation) for a cleaner
            // multi-line SQL statement.
            stmt.execute("""
                CREATE TABLE IF NOT EXISTS students (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    grade REAL
                )
                """);

            stmt.execute("INSERT INTO students (name, grade) VALUES ('Alice', 92.5)");
            stmt.execute("INSERT INTO students (name, grade) VALUES ('Bob', 87.0)");

        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    static void printAllStudents() {
        String sql = "SELECT * FROM students";

        try (Connection conn = DriverManager.getConnection(URL);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            System.out.println("-- students --");
            while (rs.next()) {
                System.out.printf("%d: %s - %.1f%n",
                    rs.getInt("id"), rs.getString("name"), rs.getDouble("grade"));
            }
        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }

    static void updateGrade(String name, double newGrade) {
        String sql = "UPDATE students SET grade = ? WHERE name = ?";

        try (Connection conn = DriverManager.getConnection(URL);
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setDouble(1, newGrade);
            pstmt.setString(2, name);
            int rowsUpdated = pstmt.executeUpdate();
            System.out.println("Rows updated: " + rowsUpdated);

        } catch (SQLException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}