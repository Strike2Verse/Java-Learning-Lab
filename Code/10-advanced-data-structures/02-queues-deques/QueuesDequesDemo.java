import java.util.ArrayDeque;
import java.util.Deque;
import java.util.LinkedList;
import java.util.Queue;

public class QueuesDequesDemo {
    public static void main(String[] args) {

        // ---- basic Queue operations ----
        Queue<Integer> queue = new LinkedList<>(); // LinkedList implements Queue too
        queue.offer(10); // add to the back
        queue.offer(20);
        queue.offer(30);
        System.out.println("Queue after offers: " + queue);

        System.out.println("peek(): " + queue.peek()); // 10 — front, without removing
        System.out.println("poll(): " + queue.poll()); // 10 — removes and returns front
        System.out.println("Queue after poll: " + queue);

        System.out.println("--------------------");

        // ---- Deque: access from both ends ----
        Deque<Integer> deque = new ArrayDeque<>();
        deque.addFirst(10); // add to front
        deque.addLast(20);  // add to back
        deque.addFirst(5);
        System.out.println("Deque after additions: " + deque);

        System.out.println("peekFirst(): " + deque.peekFirst());
        System.out.println("peekLast(): " + deque.peekLast());

        deque.pollFirst(); // removes 5
        deque.pollLast();  // removes 20
        System.out.println("Deque after pollFirst/pollLast: " + deque);

        System.out.println("--------------------");

        // ---- Deque used as a Queue (FIFO via offer/poll) ----
        Deque<Integer> asQueue = new ArrayDeque<>();
        asQueue.offer(1); // add to back
        asQueue.offer(2);
        System.out.println("Deque as Queue, poll(): " + asQueue.poll()); // 1 — FIFO

        // ---- Deque used as a Stack (LIFO via push/pop) ----
        Deque<Integer> asStack = new ArrayDeque<>();
        asStack.push(1); // add to front
        asStack.push(2);
        System.out.println("Deque as Stack, pop(): " + asStack.pop()); // 2 — LIFO

        System.out.println("--------------------");

        // ---- practical use: processing tasks in order ----
        Queue<String> taskQueue = new LinkedList<>();
        taskQueue.offer("Send email");
        taskQueue.offer("Generate report");
        taskQueue.offer("Backup database");

        System.out.println("Processing tasks in order:");
        while (!taskQueue.isEmpty()) {
            String task = taskQueue.poll();
            System.out.println("Processing: " + task);
        }
    }
}