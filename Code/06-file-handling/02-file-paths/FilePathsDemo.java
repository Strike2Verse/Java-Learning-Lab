import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class FilePathsDemo {
    public static void main(String[] args) throws IOException {

        // ---- creating a Path (no disk access happens here) ----
        Path path = Path.of("output.txt");
        Path nested = Path.of("data", "reports", "2024.csv"); // data/reports/2024.csv

        // ---- getting information about a path ----
        System.out.println("File name: " + path.getFileName());
        System.out.println("Absolute path: " + path.toAbsolutePath());
        System.out.println("Parent of nested: " + nested.getParent());

        System.out.println("--------------------");

        // Create output.txt first so the checks below have something real to inspect.
        Files.writeString(path, "sample content");

        // ---- checking existence and type ----
        System.out.println("Exists? " + Files.exists(path));
        System.out.println("Is directory? " + Files.isDirectory(path));
        System.out.println("Is regular file? " + Files.isRegularFile(path));

        System.out.println("--------------------");

        // ---- creating directories ----
        Files.createDirectories(Path.of("data/reports")); // creates nested folders if needed
        System.out.println("Created data/reports directory");

        System.out.println("--------------------");

        // ---- listing files in a directory ----
        // try-with-resources: the stream needs to be closed properly,
        // a small preview of what's covered in the next topic.
        System.out.println("Files in current directory:");
        try (var stream = Files.list(Path.of("."))) {
            stream.forEach(System.out::println);
        }

        System.out.println("--------------------");

        // ---- deleting a file ----
        // deleteIfExists() is safe — returns false instead of throwing
        // if the file doesn't exist, unlike plain Files.delete().
        boolean deleted = Files.deleteIfExists(Path.of("temp.txt"));
        System.out.println("Deleted temp.txt (didn't exist)? " + deleted);

        System.out.println("--------------------");

        // ---- combining paths with resolve() ----
        // resolve() just joins paths together, platform-safely —
        // it does not make a path absolute or clean it up (that's normalize()).
        Path base = Path.of("data");
        Path full = base.resolve("reports").resolve("2024.csv");
        System.out.println("Resolved path: " + full);
    }
}