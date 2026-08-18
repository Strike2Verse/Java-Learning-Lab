# Jackson / Gson (JSON parsing)

File Handling noted that Java's JDK has no built-in JSON parser. This
subtopic solves that using an actual library — now that Maven/Gradle
dependency management is understood (Topic 9).

## Gson — Google's JSON library (simpler, great for learning)

Once added as a dependency (`com.google.code.gson:gson`):

Serialization (Java object → JSON):

```java
import com.google.gson.Gson;

Gson gson = new Gson();
Person person = new Person("Alice", 25);
String json = gson.toJson(person);
System.out.println(json); // {"name":"Alice","age":25}
```

Deserialization (JSON → Java object):

```java
String jsonInput = "{\"name\":\"Bob\",\"age\":30}";
Person parsed = gson.fromJson(jsonInput, Person.class);
System.out.println(parsed.name); // Bob
```

Working with collections:

```java
import java.util.List;
import com.google.gson.reflect.TypeToken;

List<Person> people = List.of(new Person("Alice", 25), new Person("Bob", 30));
String jsonArray = gson.toJson(people);

List<Person> parsedList = gson.fromJson(jsonArray, new TypeToken<List<Person>>(){}.getType());
```

`TypeToken` is needed here because Java's generics are erased at
runtime — `List<Person>` and `List<String>` both just look like `List`
to the JVM, so `TypeToken` captures the generic type information at
compile time for Gson to use during deserialization.

## Jackson — the more powerful, enterprise-standard alternative

Very similar API, slightly more setup, but far more configurable — used
heavily in real-world frameworks like Spring Boot (Jackson is Spring
Boot's built-in, production-tested default JSON handler).

```java
import com.fasterxml.jackson.databind.ObjectMapper;

ObjectMapper mapper = new ObjectMapper();

String json = mapper.writeValueAsString(person);       // serialize
Person parsed = mapper.readValue(jsonInput, Person.class); // deserialize
```

`writeValueAsString`/`readValue` throw a checked exception
(`JsonProcessingException`), so real code wraps these in `try-catch`.

## Gson vs Jackson — when to use which

| | Gson | Jackson |
|---|---|---|
| Setup | Simpler, less config | More setup, more powerful |
| Speed | Good | Generally faster for large data |
| Used in | Smaller projects, Android | Enterprise apps, Spring Boot |
| Annotations | Minimal | Rich (`@JsonProperty`, `@JsonIgnore`, etc.) |

## Why this subtopic's code can't be compiled/run directly

Same situation as Maven/Gradle: `Gson` and `ObjectMapper` only exist once
the dependency is actually downloaded via a build tool — `javac` alone
can't resolve them. The reference code is correct and would work in a
real project with the dependency configured, but isn't
standalone-runnable like earlier `javac`/`java` examples.

## Reference Files

See:
- [`Person.java`](../../Code/11-working-with-libraries/01-json-parsing/Person.java) — shared model class
- [`GsonExample.java`](../../Code/11-working-with-libraries/01-json-parsing/GsonExample.java) — Gson serialization, deserialization, and collections
- [`JacksonExample.java`](../../Code/11-working-with-libraries/01-json-parsing/JacksonExample.java) — Jackson serialization and deserialization with exception handling

These are reference examples to consult once a real project has Gson or
Jackson configured as a dependency.