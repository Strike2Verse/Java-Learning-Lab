// Reference example only — NOT compilable/runnable with plain javac/java.
// Requires the hibernate-core dependency (and jakarta.persistence) via
// Maven/Gradle, plus a configured database, to actually run.

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity // marks this class as mapped to a database table
public class Student {

    @Id // marks this field as the primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto-increment
    private Long id;

    private String name;
    private double grade;

    // Hibernate requires a no-arg constructor
    public Student() {
    }

    public Student(String name, double grade) {
        this.name = name;
        this.grade = grade;
    }

    // getters and setters — Hibernate needs these to access fields
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getGrade() {
        return grade;
    }

    public void setGrade(double grade) {
        this.grade = grade;
    }
}