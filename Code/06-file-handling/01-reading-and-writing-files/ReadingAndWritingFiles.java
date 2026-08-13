import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.List;

public class ReadingAndWritingFiles {
    public static void main(String[] args) throws IOException {

        // ---- writing to a text file (modern, simple way) ----
        String content = "Hello, this is a text file.";
        Files.writeString(Path.of("output.txt"), content);
        System.out.println("Wrote output.txt");

        // ---- reading a text file ----
        String text = Files.readString(Path.of("output.txt"));
        System.out.println("readString(): " + text);

        System.out.println("--------------------");

        // ---- appending instead of overwriting ----
        Files.writeString(Path.of("output.txt"), "\nNew line added", StandardOpenOption.APPEND);

        // ---- reading line by line ----
        List<String> lines = Files.readAllLines(Path.of("output.txt"));
        System.out.println("readAllLines():");
        for (String line : lines) {
            System.out.println(line);
        }

        System.out.println("--------------------");

        // ---- working with CSV files ----
        // A CSV file is just a text file with comma-separated values.
        List<String> rows = List.of("name,age", "Alice,25", "Bob,30");
        Files.write(Path.of("data.csv"), rows);
        System.out.println("Wrote data.csv");

        List<String> csvLines = Files.readAllLines(Path.of("data.csv"));
        System.out.println("Parsed CSV:");
        for (String line : csvLines) {
            String[] fields = line.split(",");
            System.out.println("Field 0: " + fields[0] + ", Field 1: " + fields[1]);
        }

        System.out.println("--------------------");

        // ---- writing JSON-formatted text (no parsing library yet) ----
        // Java's JDK has no built-in JSON parser. Proper JSON parsing
        // will be covered later using a library like Gson or Jackson.
        String json = """
                {
                  "name": "Alice",
                  "age": 25
                }
                """;
        Files.writeString(Path.of("data.json"), json);
        System.out.println("Wrote data.json");
        System.out.println("Raw content read back:");
        System.out.println(Files.readString(Path.of("data.json")));

        System.out.println("--------------------");

        // ---- classic try-with-resources approach (preview) ----
        // Covered properly in File Paths / Error Handling topics ahead —
        // shown here since file operations often need this pattern.
        try (BufferedWriter writer = new BufferedWriter(new FileWriter("legacy-output.txt"))) {
            writer.write("Hello via BufferedWriter");
            System.out.println("Wrote legacy-output.txt via BufferedWriter");
        } catch (IOException e) {
            System.out.println("Error writing file: " + e.getMessage());
        }
    }
}