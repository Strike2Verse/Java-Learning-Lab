public interface Flyable {
    void fly(); // no body — implicitly public and abstract

    default void land() { // has a body — implementing classes get this for free
        System.out.println("Landing safely.");
    }
}