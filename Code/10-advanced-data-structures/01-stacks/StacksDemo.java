import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Stack;

public class StacksDemo {
    public static void main(String[] args) {

        // ---- basic Stack operations ----
        Stack<Integer> stack = new Stack<>();
        stack.push(10);
        stack.push(20);
        stack.push(30);
        System.out.println("Stack after pushes: " + stack); // [10, 20, 30]

        System.out.println("peek(): " + stack.peek());  // 30 — top, not removed
        System.out.println("pop(): " + stack.pop());    // 30 — removed and returned
        System.out.println("Stack after pop: " + stack); // [10, 20]

        System.out.println("isEmpty(): " + stack.isEmpty());
        System.out.println("size(): " + stack.size());

        System.out.println("--------------------");

        // ---- modern alternative: ArrayDeque used as a stack ----
        Deque<Integer> modernStack = new ArrayDeque<>();
        modernStack.push(10);
        modernStack.push(20);
        System.out.println("ArrayDeque as stack, pop(): " + modernStack.pop()); // 20

        System.out.println("--------------------");

        // ---- practical use: reversing a string with a stack ----
        Stack<Character> charStack = new Stack<>();
        String word = "hello";
        for (char c : word.toCharArray()) {
            charStack.push(c);
        }

        StringBuilder reversed = new StringBuilder();
        while (!charStack.isEmpty()) {
            reversed.append(charStack.pop());
        }
        System.out.println("Reversed \"" + word + "\": " + reversed);

        System.out.println("--------------------");

        // ---- practical use: checking balanced parentheses ----
        System.out.println("isBalanced(\"(a(b)c)\"): " + isBalanced("(a(b)c)")); // true
        System.out.println("isBalanced(\"(a(b)c\"): " + isBalanced("(a(b)c"));   // false — unclosed
        System.out.println("isBalanced(\"a)b(c\"): " + isBalanced("a)b(c"));     // false — closes with nothing to match
    }

    static boolean isBalanced(String expression) {
        Stack<Character> stack = new Stack<>();
        for (char c : expression.toCharArray()) {
            if (c == '(') {
                stack.push(c);
            } else if (c == ')') {
                if (stack.isEmpty()) return false; // closing with nothing to match
                stack.pop();
            }
        }
        return stack.isEmpty(); // true only if every '(' was matched
    }
}