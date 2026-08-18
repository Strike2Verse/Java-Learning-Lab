// Reference example only — NOT compilable/runnable with plain javac/java.
// Requires the Gson dependency to be added via Maven/Gradle first
// (see Topic 9: Third-party Dependencies).

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.util.List;

public class GsonExample {
    public static void main(String[] args) {

        Gson gson = new Gson();

        // ---- serialization: Java object -> JSON string ----
        Person person = new Person("Alice", 25);
        String json = gson.toJson(person);
        System.out.println(json); // {"name":"Alice","age":25}

        // ---- deserialization: JSON string -> Java object ----
        String jsonInput = "{\"name\":\"Bob\",\"age\":30}";
        Person parsed = gson.fromJson(jsonInput, Person.class);
        System.out.println(parsed.name); // Bob
        System.out.println(parsed.age);  // 30

        // ---- working with collections ----
        List<Person> people = List.of(new Person("Alice", 25), new Person("Bob", 30));
        String jsonArray = gson.toJson(people);
        System.out.println(jsonArray);
        // [{"name":"Alice","age":25},{"name":"Bob","age":30}]

        // TypeToken is needed here because generics are erased at runtime —
        // Gson needs this hint to know it's parsing a List<Person>,
        // not just a raw List.
        List<Person> parsedList = gson.fromJson(jsonArray, new TypeToken<List<Person>>(){}.getType());
        System.out.println(parsedList);
    }
}