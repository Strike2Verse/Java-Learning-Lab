# MySQL Database Integration

## What makes MySQL different from SQLite

MySQL is a client-server database — it runs as a separate process
(locally or on a remote server), and a Java application connects to it
over a network connection, with credentials required. Multiple
applications/users can connect to the same MySQL server simultaneously.

## Dependency (for reference)

```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <version>8.3.0</version>
</dependency>
```

## Connecting to MySQL

```java
String url = "jdbc:mysql://localhost:3306/mydatabase"; // host:port/database_name
String username = "root";
String password = "yourpassword";

try (Connection conn = DriverManager.getConnection(url, username, password)) {
    System.out.println("Connected to MySQL successfully!");
} catch (SQLException e) {
    System.out.println("Connection failed: " + e.getMessage());
}
```

Different URL structure than SQLite's file path: `jdbc:mysql://host:port/database`
plus separate `username`/`password` parameters.

## Everything else about JDBC stays identical

`Connection`, `Statement`, `PreparedStatement`, `ResultSet`,
`executeQuery`, `executeUpdate` are JDBC **interfaces** — each
database's driver (SQLite driver, MySQL connector) provides its own
concrete implementation underneath. This is polymorphism (from OOP)
applied at the library level — code depends on the interface, not the
specific implementation, so switching databases mostly just means
swapping the driver and connection string.

```java
try (Connection conn = DriverManager.getConnection(url, username, password);
     PreparedStatement pstmt = conn.prepareStatement("INSERT INTO users (name, email) VALUES (?, ?)")) {

    pstmt.setString(1, "Alice");
    pstmt.setString(2, "alice@example.com");
    pstmt.executeUpdate();
}
```

## Connection pooling

Opening/closing a MySQL connection for every single query is slow — real
applications use a connection pool (a pre-created set of reusable
connections) instead of connecting fresh each time, since establishing a
connection has real overhead (network handshake, authentication).

```
// Conceptually (using a library like HikariCP, not shown in full here):
// - Pool maintains, say, 10 open connections
// - Application "borrows" one, uses it, "returns" it — never actually closes/reopens
// - Much faster than creating a new connection per query
```

Raw `DriverManager.getConnection()` per-query is fine for learning, but
not how real systems are built.

## Handling connection failures gracefully

```java
try (Connection conn = DriverManager.getConnection(url, username, password)) {
    // ...
} catch (SQLException e) {
    if (e.getMessage().contains("Access denied")) {
        System.out.println("Invalid username or password.");
    } else if (e.getMessage().contains("Unknown database")) {
        System.out.println("Database does not exist.");
    } else {
        System.out.println("Connection error: " + e.getMessage());
    }
}
```

## SQLite vs MySQL — when to use which

| | SQLite | MySQL |
|---|---|---|
| Setup | None — just a file | Requires installing/running a server |
| Concurrent users | Limited | Built for many simultaneous users |
| Use case | Local apps, learning, small tools | Web apps, production systems, shared data |

## Reference File

See [`MySQLExample.java`](../../Code/15-working-with-databases/03-mysql-integration/MySQLExample.java)
for a reference example covering connecting, creating a table, inserting
with `PreparedStatement`, querying, and handling connection failures with
specific error messages.

**Note:** requires the `mysql-connector-j` driver dependency and a
running MySQL server to actually compile and run against.