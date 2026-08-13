# Reading and Writing Files (Text, CSV, JSON)

## Import required

```java
import java.io.*;
import java.nio.file.*;
```

## Writing to a text file

The modern, simple way using `Files`:

```java
String content = "Hello, this is a text file.";
Files.writeString(Path.of("output.txt"), content);
```

## Reading a text file

```java
String text = Files.readString(Path.of("output.txt"));
System.out.println(text);
```

## Reading line by line

Useful for larger files — returns a ready-to-loop `List<String>` instead
of one giant block of text:

```java
List<String> lines = Files.readAllLines(Path.of("output.txt"));
for (String line : lines) {
    System.out.println(line);
}
```

## Appending to a file (instead of overwriting)

```java
Files.writeString(Path.of("output.txt"), "\nNew line added", StandardOpenOption.APPEND);
```

## Working with CSV files

A CSV file is just a text file with comma-separated values — no special
library needed for basics:

```java
// Writing a simple CSV
List<String> rows = List.of("name,age", "Alice,25", "Bob,30");
Files.write(Path.of("data.csv"), rows);

// Reading and parsing it
List<String> csvLines = Files.readAllLines(Path.of("data.csv"));
for (String line : csvLines) {
    String[] fields = line.split(",");
    System.out.println("Name: " + fields[0] + ", Age: " + fields[1]);
}
```

## Working with JSON files (basic, without external libraries)

The JDK's standard library has no built-in JSON parser — normally a
library like **Gson** or **Jackson** is used (covered later in "Working
with Libraries"). For now, JSON-formatted text can be written manually:

```java
String json = """
        {
          "name": "Alice",
          "age": 25
        }
        """;
Files.writeString(Path.of("data.json"), json);
```

Reading it back only gives the raw text — actually parsing it into usable
Java objects requires a JSON library.

## The classic try-with-resources approach (preview)

```java
try (BufferedWriter writer = new BufferedWriter(new FileWriter("output.txt"))) {
    writer.write("Hello via BufferedWriter");
} catch (IOException e) {
    System.out.println("Error writing file: " + e.getMessage());
}
```

`try-with-resources` and exception handling are covered properly in the
next two topics — this is just a preview since file operations often need
this pattern.

## Practice Program

See [`ReadingAndWritingFiles.java`](../../Code/06-file-handling/01-reading-and-writing-files/ReadingAndWritingFiles.java)
for a runnable example covering:
- Writing and reading a text file
- Appending and reading line by line
- Writing and parsing a basic CSV
- Writing JSON-formatted text (no parsing yet)
- A `try-with-resources` + `BufferedWriter` preview