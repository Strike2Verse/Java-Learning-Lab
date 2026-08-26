// Reference example only — requires spring-boot-starter-data-jpa
// additionally, plus a configured database (ties back to JDBC/Hibernate
// from Working with Databases).

import org.springframework.data.jpa.repository.JpaRepository;

// Spring Data JPA builds on Hibernate to make database access even
// simpler than raw Hibernate. CRUD methods (save, findById, findAll,
// delete...) are generated automatically — no implementation needed.
public interface PersonRepository extends JpaRepository<Person, Long> {
    // Custom query methods can also be declared by naming convention alone,
    // e.g.: List<Person> findByName(String name);
}