// Reference example only — NOT compilable/runnable with plain javac/java.
// Requires spring-boot-starter-web (see MyApplication.java).

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController // marks this class as a REST API controller
public class HelloController {

    // ---- basic GET endpoint ----
    @GetMapping("/hello") // maps GET requests to /hello
    public String hello() {
        return "Hello from Spring Boot!";
    }

    // ---- reading a request parameter (?name=...) ----
    @GetMapping("/greet")
    public String greet(@RequestParam String name) {
        return "Hello, " + name + "!";
    }

    // ---- reading a path variable ({id} in the URL) ----
    @GetMapping("/user/{id}")
    public String getUser(@PathVariable int id) {
        return "User ID: " + id;
    }

    // ---- returning JSON automatically (Jackson, from Working with Libraries) ----
    @GetMapping("/person")
    public Person getPerson() {
        // Spring Boot automatically converts this to JSON using Jackson
        // internally — no manual ObjectMapper call needed.
        return new Person("Alice", 25);
    }

    // ---- POST with a JSON request body ----
    @PostMapping("/person")
    public String createPerson(@RequestBody Person person) {
        // JSON in the request body -> Java object automatically
        return "Created: " + person.getName() + " (" + person.getAge() + ")";
    }
}