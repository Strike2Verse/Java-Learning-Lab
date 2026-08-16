// Default package — no package statement.
import com.javalab.utils.MathHelper;
import com.javalab.utils.StringHelper;
// InternalHelper is package-private, so it CANNOT be imported or used
// here — only classes inside com.javalab.utils can access it.

public class Main {
    public static void main(String[] args) {

        System.out.println("square(6) = " + MathHelper.square(6));

        String repeated = StringHelper.repeat("ab", 3);
        System.out.println("repeat(\"ab\", 3) = " + repeated);

        // InternalHelper.logInternal("test"); // COMPILE ERROR — not accessible from here
    }
}