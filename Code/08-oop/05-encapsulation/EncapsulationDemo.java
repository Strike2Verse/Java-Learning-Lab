public class EncapsulationDemo {
    public static void main(String[] args) {

        BankAccount account = new BankAccount("Alice", 100);

        // account.balance = -5000; // COMPILE ERROR — balance is private

        System.out.println("Account holder: " + account.getAccountHolder());
        System.out.println("Starting balance: $" + account.getBalance());

        System.out.println("--------------------");

        // ---- purpose-specific methods enforce validation ----
        account.deposit(50);   // Deposited $50.0. New balance: $150.0
        account.deposit(-10);  // rejected — must be positive
        account.withdraw(30);  // Withdrew $30.0. New balance: $120.0
        account.withdraw(500); // rejected — insufficient funds

        System.out.println("--------------------");

        System.out.println("Final balance: $" + account.getBalance());

        // accountHolder has no setter — it can only ever be read, never changed.
        System.out.println("Account holder is still: " + account.getAccountHolder());
    }
}