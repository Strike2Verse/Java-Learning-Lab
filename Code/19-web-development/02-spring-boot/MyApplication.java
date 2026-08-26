// Reference example only — NOT compilable/runnable with plain javac/java.
// Requires the spring-boot-starter-web dependency via Maven/Gradle.
//
// Maven dependency:
// <dependency>
//     <groupId>org.springframework.boot</groupId>
//     <artifactId>spring-boot-starter-web</artifactId>
//     <version>3.2.4</version>
// </dependency>

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MyApplication {
    public static void main(String[] args) {
        // Starts an entire embedded web server — no separate Tomcat
        // installation needed (unlike raw Servlets), it's bundled in.
        SpringApplication.run(MyApplication.class, args);
    }
}