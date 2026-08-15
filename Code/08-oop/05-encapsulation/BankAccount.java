public class BankAccount {

    // private fields — not directly accessible from outside this class
    private double balance;
    private final String accountHolder; // set once via constructor, never changed

    public BankAccount(String accountHolder, double initialBalance) {
        this.accountHolder = accountHolder;
        this.balance = initialBalance;
    }

    // getter only — no setter, so accountHolder is effectively read-only
    public String getAccountHolder() {
        return accountHolder;
    }

    // getter — controlled read access to balance
    public double getBalance() {
        return balance;
    }

    // purpose-specific methods instead of a generic setBalance():
    // each enforces its own validation/business rule.
    public void deposit(double amount) {
        if (amount <= 0) {
            System.out.println("Deposit must be positive.");
            return;
        }
        balance += amount;
        System.out.println("Deposited $" + amount + ". New balance: $" + balance);
    }

    public void withdraw(double amount) {
        if (amount > balance) {
            System.out.println("Insufficient funds.");
            return;
        }
        balance -= amount;
        System.out.println("Withdrew $" + amount + ". New balance: $" + balance);
    }
}