public class ConditionalStatements {
    public static void main(String[] args) {

        // ---- if / else if / else: Grade Calculator ----

        // The value we are checking against different ranges
        int marks = 78;

        // This will hold the final grade once decided below
        char grade;

        // Java checks these conditions top to bottom.
        // The moment one is true, that block runs and the rest are skipped.
        if (marks >= 90) {
            grade = 'A'; // marks 90 and above -> A
        } else if (marks >= 75) {
            grade = 'B'; // marks 75-89 -> B
        } else if (marks >= 60) {
            grade = 'C'; // marks 60-74 -> C
        } else if (marks >= 40) {
            grade = 'D'; // marks 40-59 -> D
        } else {
            grade = 'F'; // anything below 40 -> F (fallback case)
        }

        System.out.println("Marks: " + marks);
        System.out.println("Grade: " + grade);

        System.out.println("--------------------");

        // ---- switch: Day Name Lookup ----

        // The number we are matching against specific cases below
        int day = 3;

        // This will hold the matching day name
        String dayName;

        // switch checks "day" against each case one by one.
        // Arrow syntax (->) runs only the matched case, automatically —
        // no break needed, and no risk of accidentally falling through
        // into the next case.
        switch (day) {
            case 1 -> dayName = "Monday";
            case 2 -> dayName = "Tuesday";
            case 3 -> dayName = "Wednesday";
            case 4 -> dayName = "Thursday";
            case 5 -> dayName = "Friday";
            case 6 -> dayName = "Saturday";
            case 7 -> dayName = "Sunday";
            default -> dayName = "Invalid day"; // runs only if nothing above matched
        }

        System.out.println("Day number: " + day);
        System.out.println("Day name: " + dayName);
    }
}