# Third-party Dependencies (Maven/Gradle)

Unlike other subtopics, this one is about project setup and tooling
rather than pure Java syntax.

## The problem build tools solve

Everything covered so far uses only the JDK's built-in classes. Real
projects often need third-party libraries — like Gson (JSON parsing,
mentioned back in File Handling), JUnit (testing, coming later), or
Apache Commons. Manually downloading `.jar` files and managing classpaths
gets unmanageable fast. Build tools automate this — both dependency
management (fetching external libraries) and the full build pipeline
(compiling, testing, packaging), ensuring consistent, repeatable builds.

## Maven — the more established, XML-based tool

Maven projects are defined by a `pom.xml` file (Project Object Model):

```xml
<project>
    <groupId>com.javalab</groupId>
    <artifactId>java-learning-lab</artifactId>
    <version>1.0</version>

    <dependencies>
        <dependency>
            <groupId>com.google.code.gson</groupId>
            <artifactId>gson</artifactId>
            <version>2.10.1</version>
        </dependency>
    </dependencies>
</project>
```

Running `mvn install` (or similar) automatically downloads the
dependency, adds it to the classpath, and makes it available in code —
no manual `.jar` juggling.

## Gradle — newer, more flexible, uses a script

Gradle projects use a `build.gradle` file (Groovy or Kotlin syntax):

```groovy
plugins {
    id 'java'
}

repositories {
    mavenCentral() // where to download dependencies from
}

dependencies {
    implementation 'com.google.code.gson:gson:2.10.1'
}
```

Running `gradle build` does the same job — downloads, resolves, and links
the dependency.

## Maven vs Gradle — quick comparison

| | Maven | Gradle |
|---|---|---|
| Config format | XML (`pom.xml`) | Groovy/Kotlin script (`build.gradle`) |
| Style | Declarative, rigid structure | Flexible, more like real code |
| Speed | Slower (less caching historically) | Generally faster (incremental builds) |
| Common in | Older/enterprise Java projects | Newer projects, Android development |

Neither is universally "better" — many companies use Maven because it was
established first and is deeply entrenched; Gradle has gained popularity
for new projects, especially Android development.

## Using a dependency once it's added

Once configured, using a third-party class is no different from using a
built-in one — same `import` syntax:

```java
import com.google.gson.Gson; // this class comes from the gson dependency, not the JDK

Gson gson = new Gson();
String json = gson.toJson(someObject); // actual JSON parsing (finally!)
```

This resolves the JSON-parsing limitation mentioned back in File
Handling, where the JDK had no built-in JSON parser.

## Why this subtopic has no runnable javac/java example

Actually running code that uses a dependency like Gson requires the
dependency to be physically downloaded and placed on the classpath —
which only happens through Maven/Gradle actually executing (`mvn
install`, `gradle build`), not through `javac`/`java` alone. This
subtopic is fundamentally about tooling and configuration, not
standalone-runnable code.

## Reference Files

See:
- [`pom.xml`](../../Code/09-packages-and-build-tools/04-third-party-dependencies/pom.xml) — Maven configuration example
- [`build.gradle`](../../Code/09-packages-and-build-tools/04-third-party-dependencies/build.gradle) — Gradle configuration example

These are reference examples to consult whenever a real project needs an
external library — not meant to be compiled or run directly.