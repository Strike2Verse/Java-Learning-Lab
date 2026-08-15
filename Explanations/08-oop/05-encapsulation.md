# Encapsulation

Encapsulation means hiding an object's internal data and only exposing
controlled ways to access or modify it — instead of letting outside code
freely modify fields directly.

## The problem with public fields

```java
public class BankAccount {
    public double balance;
}
```

```java
BankAccount account = new BankAccount();
account.balance = -5000; // nothing stops this! Invalid state, but Java allows it
```

Nothing enforces any rules — any code anywhere can set `balance` to
anything, even nonsense values.

## The fix: private fields + public getters/setters

```java
public class BankAccount {
    private double balance; // no longer directly accessible from outside

    public double getBalance() { // "getter" — controlled read access
        return balance;
    }

    public void setBalance(double balance) { // "setter" — controlled write access
        if (balance < 0) {
            System.out.println("Balance cannot be negative.");
            return;
        }
        this.balance = balance;
    }
}
```

`private` alone isn't enough — getters/setters (or purpose-specific
methods) and a constructor are needed alongside it to provide any
controlled access at all.

## Access modifiers (the visibility levels)

| Modifier | Accessible from |
|---|---|
| `private` | Only within the same class |
| *(no modifier / default)* | Same package only |
| `protected` | Same package + subclasses (even in other packages) |
| `public` | Anywhere |

## Why encapsulation matters

- **Validation** — setters can reject invalid values.
- **Flexibility** — internal storage can change later without breaking
  code that uses the class, as long as the public methods stay the same.
- **Read-only fields** — a getter without a setter makes a field
  effectively read-only from outside.

```java
public class BankAccount {
    private final String accountHolder; // set once, never changed

    public BankAccount(String accountHolder) {
        this.accountHolder = accountHolder;
    }

    public String getAccountHolder() { // getter only — no setter
        return accountHolder;
    }
}
```

## Encapsulating with methods, not just getters/setters

```java
public class BankAccount {
    private double balance;

    public void deposit(double amount) {
        if (amount <= 0) {
            System.out.println("Deposit must be positive.");
            return;
        }
        balance += amount;
    }

    public void withdraw(double amount) {
        if (amount > balance) {
            System.out.println("Insufficient funds.");
            return;
        }
        balance -= amount;
    }

    public double getBalance() {
        return balance;
    }
}
```

`deposit`/`withdraw` are often better than a plain setter — instead of
`setBalance(balance + 100)`, purpose-specific methods clearly express
intent and enforce rules specific to each action, rather than letting a
caller overwrite the raw value directly.

## Practice Program

See:
- [`BankAccount.java`](../../Code/08-oop/05-encapsulation/BankAccount.java) —
  private fields, a read-only field, and validated `deposit`/`withdraw`
  methods
- [`EncapsulationDemo.java`](../../Code/08-oop/05-encapsulation/EncapsulationDemo.java) —
  a runnable example showing controlled access, rejected invalid
  operations, and the read-only `accountHolder` field

### Compiling and running

```bash
cd Code/08-oop/05-encapsulation
javac EncapsulationDemo.java BankAccount.java
java EncapsulationDemo
```