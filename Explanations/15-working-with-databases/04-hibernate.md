# Hibernate (ORM)

The final subtopic of Working with Databases.

## What ORM (Object-Relational Mapping) means

Raw JDBC required manually writing SQL and manually converting between
database rows and Java objects (`rs.getString("name")`, etc.). Hibernate
is an ORM — it automatically maps Java classes to database tables,
allowing work with objects instead of SQL directly.

## Dependency (for reference)

```xml
<dependency>
    <groupId>org.hibernate.orm</groupId>
    <artifactId>hibernate-core</artifactId>
    <version>6.4.4.Final</version>
</dependency>
```

## Defining an entity — a class mapped to a table

```java
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

@Entity // marks this class as mapped to a database table
public class Student {

    @Id // marks this field as the primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // auto-increment
    private Long id;

    private String name;
    private double grade;

    public Student() {} // Hibernate requires a no-arg constructor

    public Student(String name, double grade) {
        this.name = name;
        this.grade = grade;
    }

    // getters and setters (Hibernate needs these to access fields)
}
```

This is a regular Java class (a "POJO" — Plain Old Java Object) with
annotations added — no SQL involved in defining it.

## Saving an object

```java
Session session = sessionFactory.openSession();
session.beginTransaction();

Student student = new Student("Alice", 92.5);
session.persist(student); // Hibernate generates and runs the INSERT automatically

session.getTransaction().commit();
session.close();
```

## Retrieving an object by ID

```java
Session session = sessionFactory.openSession();
Student student = session.find(Student.class, 1L); // Hibernate generates the SELECT
System.out.println(student.getName());
session.close();
```

## Querying with HQL (Hibernate Query Language)

```java
Session session = sessionFactory.openSession();
List<Student> topStudents = session
    .createQuery("FROM Student WHERE grade > :minGrade", Student.class)
    .setParameter("minGrade", 90.0)
    .getResultList();
session.close();
```

`FROM Student` (the class name), not `FROM students` (a table name) —
HQL queries in terms of Java objects, and Hibernate translates it to
actual SQL behind the scenes.

## Why use Hibernate instead of raw JDBC?

- No manual SQL writing for basic CRUD (Create, Read, Update, Delete)
  operations.
- Works with objects directly — feels like regular Java, not database
  code.
- Handles relationships between entities (e.g., a `Student` has many
  `Course`s) far more elegantly than manual JDBC joins.

## The tradeoff

- More setup/configuration than raw JDBC.
- "Magic" happening behind the scenes can make debugging harder.
- For simple projects, raw JDBC (or SQLite) might genuinely be simpler
  and more transparent.

## Reference Files

See:
- [`Student.java`](../../Code/15-working-with-databases/04-hibernate/Student.java) — an `@Entity` class mapped to a table
- [`HibernateExample.java`](../../Code/15-working-with-databases/04-hibernate/HibernateExample.java) —
  saving, retrieving by ID, and querying with HQL

**Note:** requires `hibernate-core`, `jakarta.persistence`, a configured
database, and a properly set up `SessionFactory` (typically via
`hibernate.cfg.xml`) to actually compile and run — the example's
`buildSessionFactory()` is intentionally left unimplemented, since full
configuration is beyond the scope of this reference.