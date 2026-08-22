# JDBC Basics

JDBC (Java Database Connectivity) is Java's standard API for connecting
to and interacting with relational databases — the foundation every
database library (including Hibernate, later in this topic) builds on.

## The core JDBC workflow

```java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
```

### Step 1 — Connect

```java
String url = "jdbc:sqlite:mydatabase.db"; // connection string — varies by database type
try (Connection conn = DriverManager.getConnection(url)) {
    // work with the connection here
} catch (SQLException e) {
    System.out.println("Connection failed: " + e.getMessage());
}
```

`Connection` implements `AutoCloseable`, exactly like the custom
`DatabaseConnection` example from Advanced Topics — `try-with-resources`
guarantees it's closed, preventing connection leaks.

### Step 2 — Create/query with a Statement

```java
try (Connection conn = DriverManager.getConnection(url);
     Statement stmt = conn.createStatement()) {

    stmt.execute("CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, age INTEGER)");
    stmt.execute("INSERT INTO users (name, age) VALUES ('Alice', 25)");
}
```

### Step 3 — Query and read results with ResultSet

```java
try (Connection conn = DriverManager.getConnection(url);
     Statement stmt = conn.createStatement();
     ResultSet rs = stmt.executeQuery("SELECT * FROM users")) {

    while (rs.next()) { // moves to the next row, returns false when done
        int id = rs.getInt("id");
        String name = rs.getString("name");
        int age = rs.getInt("age");
        System.out.println(id + ": " + name + " (" + age + ")");
    }
}
```

## PreparedStatement — the safer way to insert dynamic values

```java
String sql = "INSERT INTO users (name, age) VALUES (?, ?)"; // ? = placeholder

try (Connection conn = DriverManager.getConnection(url);
     PreparedStatement pstmt = conn.prepareStatement(sql)) {

    pstmt.setString(1, "Bob"); // fills first ?
    pstmt.setInt(2, 30);        // fills second ?
    pstmt.executeUpdate();
}
```

Directly concatenating user input into SQL strings creates a **SQL
injection** vulnerability — a malicious user could inject SQL code
through the input. `PreparedStatement` treats input values as data, not
executable SQL syntax, safely escaping them automatically.

## executeQuery vs executeUpdate vs execute

- `executeQuery` — for `SELECT`, returns a `ResultSet`
- `executeUpdate` — for `INSERT`/`UPDATE`/`DELETE`, returns number of
  rows affected
- `execute` — general-purpose, works for anything (like `CREATE TABLE`)

## Reference File

See [`JdbcBasicsExample.java`](../../Code/15-working-with-databases/01-jdbc-basics/JdbcBasicsExample.java)
for a reference example covering connecting, creating a table, inserting
with both `Statement` and `PreparedStatement`, and reading results with
`ResultSet`.

**Note:** `java.sql` (JDBC's core API) is part of the JDK itself, so this
compiles without an external dependency. Actually running it requires a
JDBC driver for the target database (e.g., `sqlite-jdbc` for SQLite) on
the classpath, plus a real/creatable database file.