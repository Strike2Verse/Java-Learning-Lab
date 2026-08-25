# Sockets in Java

A socket is an endpoint for communication between two programs over a
network — one program listens (the server), another connects to it (the
client). This is the low-level foundation that things like `HttpClient`
(Web Scraping) are actually built on top of.

## Building a simple server

```java
import java.net.ServerSocket;
import java.net.Socket;
import java.io.PrintWriter;
import java.io.BufferedReader;
import java.io.InputStreamReader;

public class SimpleServer {
    public static void main(String[] args) throws Exception {
        ServerSocket serverSocket = new ServerSocket(5000); // listens on port 5000
        System.out.println("Server waiting for connection...");

        Socket clientSocket = serverSocket.accept(); // blocks until a client connects
        System.out.println("Client connected!");

        BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
        PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true);

        String message = in.readLine();
        System.out.println("Received: " + message);
        out.println("Hello from server!");

        clientSocket.close();
        serverSocket.close();
    }
}
```

`accept()` pauses execution on that line, waiting until a client actually
connects, then returns a `Socket` representing that specific connection.

## Building a simple client

```java
import java.net.Socket;
import java.io.PrintWriter;
import java.io.BufferedReader;
import java.io.InputStreamReader;

public class SimpleClient {
    public static void main(String[] args) throws Exception {
        Socket socket = new Socket("localhost", 5000); // connects to the server

        PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
        BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));

        out.println("Hello from client!");
        String response = in.readLine();
        System.out.println("Server said: " + response);

        socket.close();
    }
}
```

The server must be started before the client connects — otherwise the OS
refuses the connection, since nothing is listening on that port yet.

## Handling multiple clients

A basic server can only handle one client at a time — `accept()` blocks
until the next client connects. Real servers handle each client on its
own thread:

```java
ServerSocket serverSocket = new ServerSocket(5000);

while (true) {
    Socket clientSocket = serverSocket.accept();
    new Thread(() -> handleClient(clientSocket)).start(); // each client gets its own thread
}
```

The `Thread`/`Runnable` pattern from Multithreading — without it, one
slow client would block every other client from connecting.

## Why sockets matter

- `HttpClient` (Web Scraping) uses sockets internally — it wraps the HTTP
  protocol on top.
- `Connection` (JDBC, Databases) also uses a socket underneath to talk to
  the database server.
- Sockets are the raw building block; almost everything else learned
  about networking is built on top of this.

## Practice Program

See:
- [`SimpleServer.java`](../../Code/17-networking/01-sockets/SimpleServer.java) —
  a multithreaded server, handling each client on its own thread
- [`SimpleClient.java`](../../Code/17-networking/01-sockets/SimpleClient.java) —
  a client that connects, sends a message, and reads the response

### Compiling and running

These are **two separate programs** that must run as two separate
processes at the same time. Both compile with plain `javac`/`java` — no
external dependency needed.

**Terminal 1 — start the server first:**
```bash
cd Code/17-networking/01-sockets
javac SimpleServer.java
java SimpleServer
```

**Terminal 2 — then run the client:**
```bash
cd Code/17-networking/01-sockets
javac SimpleClient.java
java SimpleClient
```

The client should print the server's response, and the server's terminal
should show the received message and stay running (ready for more
clients, since it loops).