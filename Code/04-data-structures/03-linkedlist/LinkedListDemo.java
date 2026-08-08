import java.util.LinkedList;

public class LinkedListDemo {
    public static void main(String[] args) {

        // ---- creating and using LinkedList (same API as ArrayList) ----
        LinkedList<String> fruits = new LinkedList<>();
        fruits.add("Apple");
        fruits.add("Banana");
        fruits.add("Cherry");
        System.out.println("After adding: " + fruits);

        System.out.println("First fruit: " + fruits.get(0));

        fruits.remove("Banana");
        System.out.println("After removing Banana: " + fruits);

        System.out.println("Size: " + fruits.size());

        System.out.println("Looping through fruits:");
        for (String fruit : fruits) {
            System.out.println(fruit);
        }

        System.out.println("--------------------");

        // ---- LinkedList-specific methods ----
        // These make LinkedList naturally suited for Queue/Deque use,
        // since they only need to relink pointers, not shift elements.
        fruits.addFirst("Mango");   // adds to the very beginning
        fruits.addLast("Grape");    // adds to the very end
        System.out.println("After addFirst(Mango) and addLast(Grape): " + fruits);

        System.out.println("Peek first: " + fruits.peekFirst()); // look without removing
        System.out.println("Peek last: " + fruits.peekLast());

        fruits.removeFirst(); // removes "Mango"
        fruits.removeLast();  // removes "Grape"
        System.out.println("After removeFirst() and removeLast(): " + fruits);

        System.out.println("--------------------");

        // ---- ArrayList vs LinkedList: get(index) performance note ----
        // ArrayList.get(i) jumps directly to that memory address (fast).
        // LinkedList.get(i) has to walk node-by-node from the start or
        // end until it reaches index i (slower for large lists).
        // Both give the same result here, just at different speeds
        // as the list grows.
        System.out.println("get(1): " + fruits.get(1));
    }
}