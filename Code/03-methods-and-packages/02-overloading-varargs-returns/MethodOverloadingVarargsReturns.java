public class MethodOverloadingVarargsReturns {

    public static void main(String[] args) {

        // ---- method overloading ----
        // Java picks the right version based on the arguments passed.
        System.out.println("add(2, 3) = " + add(2, 3));
        System.out.println("add(2.5, 3.5) = " + add(2.5, 3.5));
        System.out.println("add(1, 2, 3) = " + add(1, 2, 3));

        System.out.println("--------------------");

        // ---- varargs ----
        // sum(...) accepts any number of int arguments.
        System.out.println("sum() = " + sum());
        System.out.println("sum(5) = " + sum(5));
        System.out.println("sum(1, 2, 3, 4) = " + sum(1, 2, 3, 4));

        System.out.println("--------------------");

        // ---- regular parameter + varargs together ----
        printAll("Scores", 90, 85, 78);

        System.out.println("--------------------");

        // ---- returning multiple values via an array ----
        int[] numbers = { 4, 8, 15, 16, 23, 42 };
        int[] result = minAndMax(numbers);
        System.out.println("Min: " + result[0]);
        System.out.println("Max: " + result[1]);
    }

    // Overload 1: two ints
    static int add(int a, int b) {
        return a + b;
    }

    // Overload 2: two doubles
    static double add(double a, double b) {
        return a + b;
    }

    // Overload 3: three ints
    static int add(int a, int b, int c) {
        return a + b + c;
    }

    // Varargs: accepts any number of int arguments (treated as an array).
    static int sum(int... numbers) {
        int total = 0;
        for (int num : numbers) {
            total += num;
        }
        return total;
    }

    // Regular parameter must come before the varargs parameter.
    static void printAll(String label, int... nums) {
        System.out.println(label + ":");
        for (int num : nums) {
            System.out.println(num);
        }
    }

    // Java methods can only return one value directly, so we return
    // an array to effectively give back two results (min and max).
    static int[] minAndMax(int[] numbers) {
        int min = numbers[0];
        int max = numbers[0];
        for (int num : numbers) {
            if (num < min) min = num;
            if (num > max) max = num;
        }
        return new int[] { min, max };
    }
}