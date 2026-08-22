# SQLite in Java

SQLite is a file-based, serverless database — the entire database is one
file on disk (like `mydatabase.db`), no separate database server needed
to install or run. This makes it ideal for learning, small apps, and
local storage.

## Dependency (for reference)

```xml
<dependency>
    <groupId>org.xerial</groupId>
    <artifactId>sqlite-jdbc</artifactId>
    <version>3.45.2.0</version>
</dependency>
```

## Connecting to a SQLite database

```java
String url = "jdbc:sqlite:mydatabase.db"; // creates the file if it doesn't exist yet

try (Connection conn = DriverManager.getConnection(url)) {
    System.out.println("Connected to SQLite successfully!");
} catch (SQLException e) {
    System.out.println("Connection failed: " + e.getMessage());
}
```

No username/password, no server address — just a file path. SQLite runs
embedded, directly inside the application's process (no separate server,
no network calls) — the core structural difference from client-server
databases like MySQL (next subtopic).

## Full example: creating a table and inserting data

```java
String url = "jdbc:sqlite:students.db";

try (Connection conn = DriverManager.getConnection(url);
     Statement stmt = conn.createStatement()) {

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
```

The text block (`"""`, from String Manipulation) avoids messy string
concatenation for a cleaner multi-line SQL statement.

## Querying with a helper method

```java
public static void printAllStudents(String url) {
    String sql = "SELECT * FROM students";

    try (Connection conn = DriverManager.getConnection(url);
         Statement stmt = conn.createStatement();
         ResultSet rs = stmt.executeQuery(sql)) {

        while (rs.next()) {
            System.out.printf("%d: %s - %.1f%n",
                rs.getInt("id"), rs.getString("name"), rs.getDouble("grade"));
        }
    } catch (SQLException e) {
        System.out.println("Error: " + e.getMessage());
    }
}
```

## Updating and deleting

```java
try (Connection conn = DriverManager.getConnection(url);
     PreparedStatement pstmt = conn.prepareStatement("UPDATE students SET grade = ? WHERE name = ?")) {
    pstmt.setDouble(1, 95.0);
    pstmt.setString(2, "Alice");
    int rowsUpdated = pstmt.executeUpdate();
    System.out.println("Rows updated: " + rowsUpdated);
}
```

`executeUpdate()` returns an `int` — the number of rows affected, useful
for confirming an update/delete actually matched something (`0` rows
updated might mean the `WHERE` clause matched nothing).

## Why SQLite is a great learning tool

No setup, no server to install/configure, no credentials to manage — the
entire "database" is a portable file that can be freely deleted and
recreated while experimenting.

## Reference File

See [`SqliteExample.java`](../../Code/15-working-with-databases/02-sqlite-in-java/SqliteExample.java)
for a reference example covering connecting, creating a table with a
text block, inserting, querying, and updating with `PreparedStatement`.

**Note:** requires the `sqlite-jdbc` driver dependency to actually
compile and run.