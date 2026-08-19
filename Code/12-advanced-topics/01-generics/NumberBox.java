// T must be Number or a subclass (Integer, Double, etc.)
public class NumberBox<T extends Number> {
    private T value;

    public NumberBox(T value) {
        this.value = value;
    }

    public double doubled() {
        return value.doubleValue() * 2; // safe — guaranteed to have Number's methods
    }
}