// Reference example only — requires the Gson/Jackson dependency to
// actually compile and run (see pom.xml / build.gradle from Topic 9).
public class Person {
    String name;
    int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    // no-arg constructor — some JSON libraries need this for deserialization
    public Person() {
    }

    @Override
    public String toString() {
        return name + " (" + age + ")";
    }
}