import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.NoSuchFileException;
import java.nio.file.Path;

public class ExceptionHandlingInFileOperations {
    public static void main(String[] args) throws IOException {

        // ---- basic try-catch around a file operation ----
        System.out.println("-- basic try-catch --");
        try {
            String content = Files.readString(Path.of("missing.txt"));
            System.out.println(content);
        } catch (IOException e) {
            System.out.println("Could not read file: " + e.getMessage());
        }

        System.out.println("--------------------");

        // ---- try-with-resources: closes the resource automatically ----
        // First make sure output.txt exists so this read succeeds.
        Files.writeString(Path.of("output.txt"), "Line one\nLine two");

        System.out.println("-- try-with-resources --");
        try (BufferedReader reader = new BufferedReader(new FileReader("output.txt"))) {
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }
        } catch (IOException e) {
            System.out.println("Error reading file: " + e.getMessage());
        }

        System.out.println("--------------------");

        // ---- catching specific exceptions before general ones ----
        // NoSuchFileException must be caught BEFORE IOException, since
        // it is a subclass of IOException — catching IOException first
        // would make the more specific catch unreachable (compile error).
        System.out.println("-- specific vs general catch --");
        try {
            Files.readString(Path.of("missing.txt"));
        } catch (NoSuchFileException e) {
            System.out.println("File not found: " + e.getFile());
        } catch (IOException e) {
            System.out.println("Some other file error: " + e.getMessage());
        }

        System.out.println("--------------------");

        // ---- finally: always runs, error or not ----
        System.out.println("-- finally with an error --");
        try {
            Files.readString(Path.of("missing.txt"));
        } catch (IOException e) {
            System.out.println("Error: " + e.getMessage());
        } finally {
            System.out.println("This always runs, error or not.");
        }

        System.out.println("-- finally with success --");
        try {
            Files.readString(Path.of("output.txt")); // this one succeeds
            System.out.println("Read succeeded.");
        } catch (IOException e) {
            System.out.println("Error: " + e.getMessage());
        } finally {
            System.out.println("This still runs, even without an error.");
        }
    }
}