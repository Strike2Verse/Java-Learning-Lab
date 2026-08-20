// This example uses only the built-in JDK HttpClient (Java 11+) — no
// external dependency needed. It DOES require internet access when run,
// since it makes real HTTP requests.

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.concurrent.CompletableFuture;

public class HttpClientDemo {
    public static void main(String[] args) throws IOException, InterruptedException {

        HttpClient client = HttpClient.newHttpClient();

        // ---- basic GET request ----
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://example.com"))
            .GET() // optional, GET is the default
            .header("User-Agent", "MyJavaApp/1.0")
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println("Status: " + response.statusCode());
        System.out.println("Body length: " + response.body().length() + " characters");
        System.out.println("First 200 characters of body:");
        System.out.println(response.body().substring(0, Math.min(200, response.body().length())));

        System.out.println("--------------------");

        // ---- async request: ties back to CompletableFuture from Concurrency ----
        System.out.println("Sending async request...");
        CompletableFuture<HttpResponse<String>> futureResponse =
            client.sendAsync(request, HttpResponse.BodyHandlers.ofString());

        futureResponse.thenAccept(asyncResponse -> {
            System.out.println("Async response status: " + asyncResponse.statusCode());
        });

        // give the async request a moment to complete before the program exits
        Thread.sleep(2000);
        System.out.println("Done.");
    }
}