# Servlets & JSP

The second-to-last subtopic of the entire roadmap.

## What a Servlet is

A Servlet is a Java class that handles HTTP requests on a server — the
foundational technology beneath most Java web frameworks (including
Spring Boot, next subtopic). It's essentially `HttpClient`/Sockets
knowledge from the server's side, structured for handling web
requests/responses.

## Dependency (for reference)

```xml
<dependency>
    <groupId>jakarta.servlet</groupId>
    <artifactId>jakarta.servlet-api</artifactId>
    <version>6.0.0</version>
    <scope>provided</scope> <!-- provided by the servlet container (Tomcat), not bundled -->
</dependency>
```

## A basic Servlet

```java
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.annotation.WebServlet;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/hello") // maps this servlet to the URL path /hello
public class HelloServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        out.println("<h1>Hello from a Servlet!</h1>");
    }
}
```

`doGet` handles GET requests specifically — there's a matching `doPost`
for POST requests, mirroring the HTTP methods seen in `HttpClient`.

## Reading request parameters

```java
@Override
protected void doGet(HttpServletRequest request, HttpServletResponse response)
        throws IOException {
    String name = request.getParameter("name"); // reads ?name=... from the URL
    response.setContentType("text/html");
    PrintWriter out = response.getWriter();
    out.println("<h1>Hello, " + name + "!</h1>");
}
```

## What JSP is

JSP (JavaServer Pages) flips the model — instead of Java code generating
HTML with `println`, HTML files contain embedded Java using special
tags:

```jsp
<html>
<body>
    <h1>Hello, <%= request.getParameter("name") %>!</h1>
    <%
        int count = 5;
        for (int i = 0; i < count; i++) {
    %>
        <p>Line <%= i %></p>
    <%
        }
    %>
</body>
</html>
```

`<%= ... %>` outputs a Java expression's value; `<% ... %>` runs Java
code (like the loop) without directly outputting anything.

## Servlets vs JSP — when each shines

- **Servlets** — Java-first, HTML embedded via `println`; better for
  logic-heavy processing.
- **JSP** — HTML-first, Java embedded via tags; better for
  HTML-heavy output, feels more like a template.
- In practice, real projects often use both together — Servlet for
  logic, JSP for the view — a pattern called MVC (Model-View-Controller),
  keeping business logic and presentation separately maintainable.

## Why this matters

Writing raw Servlets/JSP for a real application gets verbose and
repetitive fast — this is exactly the gap Spring Boot (final subtopic)
fills, providing a much higher-level, more convenient way to build web
applications while still ultimately running on Servlets underneath.

## Reference Files

See:
- [`HelloServlet.java`](../../Code/19-web-development/01-servlets-jsp/HelloServlet.java) —
  a Servlet handling GET and POST requests, reading a request parameter
- [`hello.jsp`](../../Code/19-web-development/01-servlets-jsp/hello.jsp) —
  a JSP page with embedded Java expressions and a loop

**Note:** these require a servlet container (like Apache Tomcat) to
actually deploy and run — not compilable/runnable with plain
`javac`/`java`.