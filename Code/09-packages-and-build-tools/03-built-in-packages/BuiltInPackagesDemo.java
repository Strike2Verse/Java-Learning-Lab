import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Period;
import java.util.Random;

public class BuiltInPackagesDemo {
    public static void main(String[] args) {

        // ---- java.util.Random ----
        System.out.println("-- java.util.Random --");
        Random random = new Random();
        int diceRoll = random.nextInt(6) + 1; // random number 1-6
        double randomDecimal = random.nextDouble(); // random number 0.0-1.0
        boolean coinFlip = random.nextBoolean();

        System.out.println("Dice roll (1-6): " + diceRoll);
        System.out.println("Random decimal (0.0-1.0): " + randomDecimal);
        System.out.println("Coin flip: " + coinFlip);

        System.out.println("--------------------");

        // ---- java.time ----
        System.out.println("-- java.time --");
        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();
        LocalTime time = LocalTime.now();

        LocalDate birthday = LocalDate.of(2000, 5, 15); // year, month, day
        System.out.println("Today: " + today);
        System.out.println("Now (date+time): " + now);
        System.out.println("Time only: " + time);
        System.out.println("Birthday: " + birthday);

        // date arithmetic — immutable, every operation returns a NEW object
        LocalDate nextWeek = today.plusDays(7);
        LocalDate lastMonth = today.minusMonths(1);
        System.out.println("Today is still: " + today); // unchanged
        System.out.println("Next week: " + nextWeek);
        System.out.println("Last month: " + lastMonth);
        System.out.println("Is today before next week? " + today.isBefore(nextWeek));

        // calculating differences with Period
        Period age = Period.between(birthday, today);
        System.out.println("Age: " + age.getYears() + " years, "
            + age.getMonths() + " months, " + age.getDays() + " days");

        System.out.println("--------------------");

        // ---- java.math.BigDecimal ----
        System.out.println("-- java.math.BigDecimal --");

        // always use the String constructor, not double!
        BigDecimal price = new BigDecimal("19.99");
        BigDecimal tax = new BigDecimal("1.60");
        BigDecimal total = price.add(tax);
        System.out.println("Price: " + price);
        System.out.println("Tax: " + tax);
        System.out.println("Total (exact): " + total);

        // demonstrating why the String constructor matters
        BigDecimal wrong = new BigDecimal(0.1); // inherits double's imprecision
        BigDecimal right = new BigDecimal("0.1"); // exactly 0.1
        System.out.println("new BigDecimal(0.1): " + wrong);
        System.out.println("new BigDecimal(\"0.1\"): " + right);
    }
}