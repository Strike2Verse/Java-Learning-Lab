// Reference example only — NOT compilable/runnable with plain javac/java.
// Requires hibernate-core, jakarta.persistence, a configured database,
// and a properly set up SessionFactory (typically via hibernate.cfg.xml
// or annotation-based configuration, not shown here for brevity).

import org.hibernate.Session;
import org.hibernate.SessionFactory;

import java.util.List;

public class HibernateExample {

    public static void main(String[] args) {
        // Assume sessionFactory has already been built/configured elsewhere.
        SessionFactory sessionFactory = buildSessionFactory();

        saveStudent(sessionFactory, "Alice", 92.5);
        findStudentById(sessionFactory, 1L);
        queryTopStudents(sessionFactory);
    }

    // ---- saving an object: Hibernate generates the INSERT automatically ----
    static void saveStudent(SessionFactory sessionFactory, String name, double grade) {
        try (Session session = sessionFactory.openSession()) {
            session.beginTransaction();

            Student student = new Student(name, grade);
            session.persist(student); // Hibernate generates and runs the INSERT

            session.getTransaction().commit();
        }
    }

    // ---- retrieving an object by ID: Hibernate generates the SELECT ----
    static void findStudentById(SessionFactory sessionFactory, Long id) {
        try (Session session = sessionFactory.openSession()) {
            Student student = session.find(Student.class, id);
            if (student != null) {
                System.out.println("Found: " + student.getName() + " (" + student.getGrade() + ")");
            } else {
                System.out.println("No student found with id " + id);
            }
        }
    }

    // ---- HQL: queries in terms of the Java class, not the table name ----
    static void queryTopStudents(SessionFactory sessionFactory) {
        try (Session session = sessionFactory.openSession()) {
            List<Student> topStudents = session
                .createQuery("FROM Student WHERE grade > :minGrade", Student.class)
                .setParameter("minGrade", 90.0)
                .getResultList();

            System.out.println("Students with grade > 90:");
            for (Student s : topStudents) {
                System.out.println(s.getName() + ": " + s.getGrade());
            }
        }
    }

    static SessionFactory buildSessionFactory() {
        // In a real project: configuration is typically loaded from
        // hibernate.cfg.xml (connection URL, dialect, entity classes, etc.)
        throw new UnsupportedOperationException(
            "SessionFactory setup omitted — this is a reference example only"
        );
    }
}