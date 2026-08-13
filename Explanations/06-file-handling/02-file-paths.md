# Working with File Paths (java.nio.file.Path)

`Path` represents a file or directory location — it doesn't touch the disk
by itself, it's just a way to represent and manipulate a file location
before actually reading/writing it.

## Import required

```java
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Files;
```

## Creating a Path

```java
Path path = Path.of("output.txt");
Path nested = Path.of("data", "reports", "2024.csv"); // builds: data/reports/2024.csv
```

Creating a `Path` object does **not** create the file on disk — it's
purely a representation in memory until a `Files` method actually acts on
it.

## Getting information about a path

```java
System.out.println(path.getFileName());   // output.txt
System.out.println(path.toAbsolutePath()); // full system path, e.g. /home/user/project/output.txt
System.out.println(nested.getParent());    // data/reports
```

## Checking existence and type

```java
System.out.println(Files.exists(path));       // true/false
System.out.println(Files.isDirectory(path));   // false (it's a file)
System.out.println(Files.isRegularFile(path)); // true
```

## Creating directories

```java
Files.createDirectories(Path.of("data/reports")); // creates nested folders if needed
```

## Listing files in a directory

```java
try (var stream = Files.list(Path.of("."))) {
    stream.forEach(System.out::println);
}
```

Uses try-with-resources — the stream needs to be closed properly, a
preview of what's covered in the next topic (Error Handling and
Exceptions).

## Deleting a file

```java
Files.deleteIfExists(Path.of("temp.txt")); // safe — returns false, doesn't throw, if file doesn't exist
```

`Files.delete()` (not shown above) throws a `NoSuchFileException` if the
target doesn't exist — `deleteIfExists()` avoids that by returning `false`
instead.

## Combining paths

```java
Path base = Path.of("data");
Path full = base.resolve("reports").resolve("2024.csv"); // data/reports/2024.csv
```

`.resolve()` simply joins paths together, platform-safely (handling `/`
vs `\` automatically) — it does not make a path absolute or clean it up.
A separate method, `.normalize()`, handles cleaning up redundant parts
like `.` and `..` in a path.

## Practice Program

See [`FilePathsDemo.java`](../../Code/06-file-handling/02-file-paths/FilePathsDemo.java)
for a runnable example covering:
- Creating a `Path` and inspecting it (file name, absolute path, parent)
- Checking existence and type
- Creating nested directories
- Listing files in the current directory
- Safely deleting a non-existent file
- Combining paths with `.resolve()`