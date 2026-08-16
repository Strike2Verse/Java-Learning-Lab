// ---- single-class imports (generally preferred) ----
import java.util.ArrayList;
import java.util.List;

// ---- static import: brings in a static member directly, skipping ----
// ---- the "Math." prefix every time it's used ----
import static java.lang.Math.PI;
import static java.lang.Math.sqrt;

public class ImportingClassesPackages {
    public static void main(String[] args) {

        // ---- using single-class imports ----
        List<String> names = new ArrayList<>();
        names.add("Alice");
        names.add("Bob");
        System.out.println("Names: " + names);

        System.out.println("--------------------");

        // ---- using static imports ----
        double radius = 5;
        double area = PI * radius * radius; // no "Math." prefix needed
        double root = sqrt(16);

        System.out.println("PI: " + PI);
        System.out.println("Area of circle (r=5): " + area);
        System.out.println("Square root of 16: " + root);

        // without the static import, this is what it would look like:
        double areaWithoutStaticImport = Math.PI * radius * radius;
        System.out.println("Same result without static import: " + areaWithoutStaticImport);

        System.out.println("--------------------");

        // ---- fully qualified names: only needed for genuine name collisions ----
        // Example: java.util.Date vs java.sql.Date share the same simple
        // name "Date", so both can't be imported normally in one file.
        java.util.Date utilDate = new java.util.Date();
        java.sql.Date sqlDate = new java.sql.Date(System.currentTimeMillis());

        System.out.println("java.util.Date: " + utilDate);
        System.out.println("java.sql.Date: " + sqlDate);
    }
}