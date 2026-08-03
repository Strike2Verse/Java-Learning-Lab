public class TypeCasting {
    public static void main(String[] args) {
        double temperature = 36.8; // Stores a decimal value.
        int wholeTemperature = (int) temperature; // Drops the decimal part.

        int quantity = 20; // Stores a whole number.
        double decimalQuantity = quantity; // Java safely converts int to double.

        System.out.println("Temperature: " + temperature); // Prints 36.8.
        System.out.println("Whole temperature: " + wholeTemperature); // Prints 36.
        System.out.println("Quantity as double: " + decimalQuantity); // Prints 20.0.
    }
}
