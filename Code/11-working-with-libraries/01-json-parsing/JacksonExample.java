// Reference example only — NOT compilable/runnable with plain javac/java.
// Requires the Jackson dependency (com.fasterxml.jackson.core:jackson-databind)
// to be added via Maven/Gradle first (see Topic 9: Third-party Dependencies).

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

public class JacksonExample {
    public static void main(String[] args) {

        ObjectMapper mapper = new ObjectMapper();

        try {
            // ---- serialization: Java object -> JSON string ----
            Person person = new Person("Alice", 25);
            String json = mapper.writeValueAsString(person);
            System.out.println(json);

            // ---- deserialization: JSON string -> Java object ----
            String jsonInput = "{\"name\":\"Bob\",\"age\":30}";
            Person parsed = mapper.readValue(jsonInput, Person.class);
            System.out.println(parsed.name);
            System.out.println(parsed.age);

        } catch (JsonProcessingException e) {
            // writeValueAsString / readValue throw this checked exception,
            // so real code must handle it.
            System.out.println("JSON processing error: " + e.getMessage());
        }
    }
}