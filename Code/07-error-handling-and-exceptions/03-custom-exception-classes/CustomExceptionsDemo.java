public class CustomExceptionsDemo {

    public static void main(String[] args) {

        // ---- using a custom unchecked exception ----
        // No try-catch is required to compile — but we use one anyway
        // to handle it gracefully, and to demonstrate the extra field.
        System.out.println("-- custom unchecked exception --");
        try {
            withdraw(100, 250);
        } catch (InsufficientFundsException e) {
            System.out.println("Error: " + e.getMessage());
            System.out.println("Shortfall: $" + e.getShortfall());
        }
        withdraw(100, 50); // succeeds, no exception

        System.out.println("--------------------");

        // ---- using a custom checked exception ----
        // Must be caught or declared — the compiler enforces this.
        System.out.println("-- custom checked exception --");
        try {
            setAge(-5);
        } catch (InvalidAgeException e) {
            System.out.println("Invalid age: " + e.getMessage());
        }

        try {
            setAge(25); // valid, no exception thrown
        } catch (InvalidAgeException e) {
            System.out.println("Invalid age: " + e.getMessage());
        }
    }

    // Throws a custom UNCHECKED exception — no "throws" declaration needed.
    static void withdraw(double balance, double amount) {
        if (amount > balance) {
            double shortfall = amount - balance;
            throw new InsufficientFundsException(
                "Cannot withdraw $" + amount + ", balance is only $" + balance,
                shortfall
            );
        }
        System.out.println("Withdrew $" + amount);
    }

    // Throws a custom CHECKED exception — must declare "throws" here.
    static void setAge(int age) throws InvalidAgeException {
        if (age < 0 || age > 150) {
            throw new InvalidAgeException("Age must be between 0 and 150, got: " + age);
        }
        System.out.println("Age set to: " + age);
    }
}