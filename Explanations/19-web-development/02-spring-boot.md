# Spring Boot

The final subtopic of the entire roadmap.

## What Spring Boot is

Spring Boot is a framework built on top of the Spring ecosystem that
dramatically simplifies building Java web applications and REST APIs —
no manual Servlet configuration, no XML setup, minimal boilerplate. This
is the much higher-level way to build the same kind of thing promised at
the end of Servlets & JSP.

## Dependency (for reference)

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <version>3.2.4</version>
</dependency>
```

## The entry point

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MyApplication {
    public static void main(String[] args) {
        SpringApplication.run(MyApplication.class, args);
    }
}
```

This single class starts an entire embedded web server — no separate
Tomcat installation needed (unlike raw Servlets), it's bundled in.

## Creating a REST endpoint

```java
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController // marks this class as a REST API controller
public class HelloController {

    @GetMapping("/hello") // maps GET requests to /hello
    public String hello() {
        return "Hello from Spring Boot!";
    }
}
```

Compared to a raw Servlet: no `HttpServletRequest`/`HttpServletResponse`
boilerplate, no manual `PrintWriter` — just a method that returns a
value. Declarative annotations replace the manual request/response
handling, URL mapping, and I/O boilerplate Servlets require.

## Reading request parameters and path variables

```java
@GetMapping("/greet")
public String greet(@RequestParam String name) { // reads ?name=... automatically
    return "Hello, " + name + "!";
}

@GetMapping("/user/{id}")
public String getUser(@PathVariable int id) { // reads the {id} from the URL path itself
    return "User ID: " + id;
}
```

## Returning JSON automatically

```java
@GetMapping("/person")
public Person getPerson() {
    return new Person("Alice", 25); // Spring Boot automatically converts this to JSON using Jackson internally
}
```

Jackson (from Working with Libraries) is Spring Boot's built-in default
JSON handler, wired in as an automatic message converter — a plain Java
object gets serialized to JSON with no manual `ObjectMapper` call needed.

## Handling POST requests with a request body

```java
@PostMapping("/person")
public String createPerson(@RequestBody Person person) { // JSON in the request body -> Java object automatically
    return "Created: " + person.getName();
}
```

## Connecting to a database

Spring Data JPA builds on Hibernate to make database access even
simpler:

```java
import org.springframework.data.jpa.repository.JpaRepository;

public interface PersonRepository extends JpaRepository<Person, Long> {
    // CRUD methods (save, findById, findAll, delete...) are generated automatically — no implementation needed!
}
```

## Why Spring Boot represents the culmination of the whole roadmap

| Concept learned | How it shows up in Spring Boot |
|---|---|
| OOP (Classes, annotations via reflection) | Controllers, entities |
| Generics | `JpaRepository<Person, Long>` |
| JSON (Jackson) | Automatic request/response conversion |
| JDBC/Hibernate | Spring Data JPA |
| Exceptions | `@ExceptionHandler` for centralized error handling |
| Dependency management (Maven/Gradle) | How Spring Boot itself gets added |
| HTTP (Servlets, HttpClient) | The underlying request/response model |

Underneath all the convenient annotations, Spring MVC is internally
implemented as one large Servlet (`DispatcherServlet`) that receives
every request and routes it to the correct controller method — Spring
builds an elegant abstraction on top of Servlets, not a replacement for
them.

## Reference Files

See:
- [`MyApplication.java`](../../Code/19-web-development/02-spring-boot/MyApplication.java) — the application entry point
- [`Person.java`](../../Code/19-web-development/02-spring-boot/Person.java) — a plain model class used for JSON conversion
- [`HelloController.java`](../../Code/19-web-development/02-spring-boot/HelloController.java) —
  a REST controller covering GET/POST endpoints, request parameters,
  path variables, and automatic JSON conversion
- [`PersonRepository.java`](../../Code/19-web-development/02-spring-boot/PersonRepository.java) —
  a Spring Data JPA repository interface

**Note:** these require `spring-boot-starter-web` (and
`spring-boot-starter-data-jpa` for the repository) to actually compile
and run — not runnable with plain `javac`/`java`.