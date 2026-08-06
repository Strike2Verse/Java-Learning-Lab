public class DefiningAndCallingMethods {

    public static void main(String[] args) {

        // ---- calling a method that returns a value ----
        int result = add(5, 3);
        System.out.println("add(5, 3) = " + result);

        // ---- calling a void method (no return value) ----
        greet("Java learner");

        // ---- calling a zero-parameter method ----
        sayHello();

        // ---- calling a zero-parameter method that DOES return a value ----
        int lucky = getLuckyNumber();
        System.out.println("Lucky number: " + lucky);
    }

    // Takes two parameters, returns their sum as an int.
    static int add(int a, int b) {
        return a + b;
    }

    // Takes one parameter, returns nothing (void).
    static void greet(String name) {
        System.out.println("Hello, " + name);
    }

    // Takes zero parameters, returns nothing (void).
    static void sayHello() {
        System.out.println("Hello!");
    }

    // Takes zero parameters, but still returns a value.
    static int getLuckyNumber() {
        return 7;
    }
}