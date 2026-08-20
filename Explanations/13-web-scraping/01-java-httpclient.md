# Java HttpClient

Java 11 introduced a modern, built-in HTTP client — no external library
needed for basic HTTP requests. This is the foundation for fetching web
pages before parsing/scraping them.

## Import required

```java
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
```

## Making a basic GET request

```java
HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://example.com"))
    .GET() // optional, GET is the default
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

System.out.println("Status: " + response.statusCode());
System.out.println("Body: " + response.body());
```

`client.send(...)` throws checked exceptions (`IOException`,
`InterruptedException`) — needs `try-catch` or a `throws` declaration.
`HttpResponse.BodyHandlers.ofString()` tells `HttpClient` how to
interpret the raw response bytes — here, decode them as a `String`.

## Adding headers

```java
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://example.com"))
    .header("User-Agent", "MyJavaApp/1.0")
    .header("Accept", "application/json")
    .build();
```

## Making a POST request with a body

```java
HttpRequest postRequest = HttpRequest.newBuilder()
    .uri(URI.create("https://example.com/api"))
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString("{\"name\":\"Alice\"}"))
    .build();
```

## Async requests (ties back to Concurrency!)

```java
CompletableFuture<HttpResponse<String>> futureResponse =
    client.sendAsync(request, HttpResponse.BodyHandlers.ofString());

futureResponse.thenAccept(response -> {
    System.out.println("Got status: " + response.statusCode());
});
```

Same `CompletableFuture` pattern from Concurrency — `sendAsync` doesn't
block, and `thenAccept` reacts once the response arrives. This matters
when fetching many URLs, since requests can run concurrently instead of
sequentially.

## Why this matters for Web Scraping

`HttpClient` returns the raw HTML as a String — unstructured text at this
point. Extracting specific data (titles, links, prices, etc.) requires an
HTML parser, which is what Jsoup (next subtopic) provides.

## Practice Program

See [`HttpClientDemo.java`](../../Code/13-web-scraping/01-java-httpclient/HttpClientDemo.java)
for a runnable example covering a basic GET request with a header, and
an async request using `sendAsync`/`thenAccept`.

**Note:** this example makes real network requests and requires internet
access to run.

### Compiling and running

```bash
cd Code/13-web-scraping/01-java-httpclient
javac HttpClientDemo.java
java HttpClientDemo
```