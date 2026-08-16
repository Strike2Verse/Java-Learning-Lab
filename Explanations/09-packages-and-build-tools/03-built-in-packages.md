# Built-in Packages (java.util, java.time, java.math)

## java.util — building on what's already been used

`Scanner`, `ArrayList`, and `HashMap` have all been used throughout the
roadmap already. `Random` is another commonly used `java.util` class:

```java
import java.util.Random;

Random random = new Random();
int diceRoll = random.nextInt(6) + 1; // random number 1-6
double randomDecimal = random.nextDouble(); // random number 0.0-1.0
boolean coinFlip = random.nextBoolean();
```

## java.time — modern date/time handling (Java 8+)

Older Java had a notoriously messy `Date`/`Calendar` API — mutable,
not thread-safe, with confusing quirks like 0-indexed months and a
year-since-1900 offset. `java.time` replaced it with a much cleaner,
immutable design, cleanly separating dates, timestamps, and times into
dedicated classes.

```java
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

LocalDate today = LocalDate.now();
LocalDateTime now = LocalDateTime.now();
LocalTime time = LocalTime.now();

LocalDate birthday = LocalDate.of(2000, 5, 15); // year, month, day
```

Date arithmetic — immutable, every operation returns a new object:

```java
LocalDate nextWeek = today.plusDays(7);
LocalDate lastMonth = today.minusMonths(1);
System.out.println(today.isBefore(nextWeek)); // true
```

`plusDays(7)` does not modify `today` — it returns a brand-new
`LocalDate`, which must be captured in a variable to use.

Calculating differences with `Period`:

```java
import java.time.Period;

Period age = Period.between(birthday, today);
System.out.println("Age: " + age.getYears() + " years");
```

## java.math — precise number handling

Regular `double`/`float` can have rounding errors, since binary floating
point can't exactly represent most base-10 decimals. For financial or
precision-critical calculations, `BigDecimal` avoids this.

```java
import java.math.BigDecimal;

BigDecimal price = new BigDecimal("19.99"); // always use the String constructor, not double!
BigDecimal tax = new BigDecimal("1.60");
BigDecimal total = price.add(tax);
System.out.println(total); // 21.59 — exact, no floating point error
```

Why the String constructor matters:

```java
BigDecimal wrong = new BigDecimal(0.1); // inherits double's imprecision
BigDecimal right = new BigDecimal("0.1"); // exactly 0.1
```

`BigInteger` (also in `java.math`) is similar, but for whole numbers
larger than `long` can hold.

## Practice Program

See [`BuiltInPackagesDemo.java`](../../Code/09-packages-and-build-tools/03-built-in-packages/BuiltInPackagesDemo.java)
for a runnable example covering:
- `Random` — dice roll, decimal, and boolean
- `LocalDate`/`LocalDateTime`/`LocalTime`, date arithmetic, and `Period`
- `BigDecimal` exact arithmetic and the `double` vs `String` constructor
  difference