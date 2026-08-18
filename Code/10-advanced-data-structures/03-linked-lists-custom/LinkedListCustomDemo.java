public class LinkedListCustomDemo {
    public static void main(String[] args) {

        MyLinkedList<String> list = new MyLinkedList<>();

        // ---- adding ----
        list.add("Apple");
        list.add("Banana");
        list.add("Cherry");
        System.out.println("After adds: " + list);
        System.out.println("Size: " + list.size());

        System.out.println("--------------------");

        // ---- get by index (walks from head each time — O(n)) ----
        System.out.println("get(0): " + list.get(0));
        System.out.println("get(2): " + list.get(2));

        try {
            list.get(10); // out of bounds
        } catch (IndexOutOfBoundsException e) {
            System.out.println("Caught: " + e.getMessage());
        }

        System.out.println("--------------------");

        // ---- removing the head (special case) ----
        list.remove("Apple");
        System.out.println("After removing head (Apple): " + list);

        // ---- removing from the middle/end (general case) ----
        list.remove("Cherry");
        System.out.println("After removing Cherry: " + list);

        // ---- removing something that doesn't exist ----
        boolean removed = list.remove("Mango");
        System.out.println("Tried removing Mango (not present): " + removed);

        System.out.println("--------------------");

        System.out.println("Final list: " + list);
        System.out.println("Final size: " + list.size());
        System.out.println("Is empty? " + list.isEmpty());
    }
}