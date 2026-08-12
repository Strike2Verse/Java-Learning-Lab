public class StringBuilderStringBufferDemo {
    public static void main(String[] args) {

        // ---- why StringBuilder exists ----
        // Using += on a String inside a loop creates a NEW String
        // object every single time, which is wasteful.
        String result = "";
        for (int i = 0; i < 5; i++) {
            result += i;
        }
        System.out.println("Built with String +=: " + result);

        System.out.println("--------------------");

        // ---- creating a StringBuilder ----
        StringBuilder sb = new StringBuilder();
        StringBuilder sb2 = new StringBuilder("Hello"); // can start with initial text

        // ---- append: adds to the end, methods can be chained ----
        sb.append("Hello");
        sb.append(" ").append("World"); // each append() returns the same StringBuilder
        System.out.println("After append: " + sb);

        // ---- insert: adds text at a specific index ----
        sb.insert(5, ",");
        System.out.println("After insert(5, \",\"): " + sb);

        // ---- delete: removes characters in an index range (end exclusive) ----
        sb.delete(5, 6);
        System.out.println("After delete(5, 6): " + sb);

        // ---- reverse: reverses the whole sequence ----
        sb.reverse();
        System.out.println("After reverse(): " + sb);

        sb.reverse(); // reverse back before continuing
        System.out.println("After reverse() again: " + sb);

        // ---- replace: replaces characters in an index range ----
        sb.replace(6, 11, "Java");
        System.out.println("After replace(6, 11, \"Java\"): " + sb);

        System.out.println("--------------------");

        // ---- converting back to a String ----
        String finalResult = sb.toString();
        System.out.println("Converted to String: " + finalResult);

        System.out.println("--------------------");

        // ---- StringBuffer: same methods, thread-safe but slower ----
        StringBuffer buffer = new StringBuffer("Thread-safe");
        buffer.append(" example");
        System.out.println("StringBuffer result: " + buffer);
    }
}