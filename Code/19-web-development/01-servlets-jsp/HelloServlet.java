// Reference example only — NOT compilable/runnable with plain javac/java.
// Requires the jakarta.servlet-api dependency (provided scope) via
// Maven/Gradle, AND a servlet container (like Apache Tomcat) to
// actually deploy and run — Servlets don't run standalone.
//
// Maven dependency:
// <dependency>
//     <groupId>jakarta.servlet</groupId>
//     <artifactId>jakarta.servlet-api</artifactId>
//     <version>6.0.0</version>
//     <scope>provided</scope> <!-- provided by the servlet container (Tomcat), not bundled -->
// </dependency>

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/hello") // maps this servlet to the URL path /hello
public class HelloServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        // reading a request parameter: ?name=... from the URL
        String name = request.getParameter("name");
        if (name == null || name.isBlank()) {
            name = "World";
        }

        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        out.println("<html><body>");
        out.println("<h1>Hello, " + name + "!</h1>");
        out.println("</body></html>");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws IOException {
        // doPost mirrors doGet but handles POST requests specifically —
        // same HTTP method split seen in HttpClient (Web Scraping).
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        out.println("<h1>Received a POST request</h1>");
    }
}