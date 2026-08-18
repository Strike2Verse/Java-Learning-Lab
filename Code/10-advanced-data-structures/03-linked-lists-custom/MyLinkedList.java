public class MyLinkedList<T> {
    private Node<T> head;
    private int size;

    public MyLinkedList() {
        this.head = null;
        this.size = 0;
    }

    // Adds a new node to the end of the list.
    public void add(T data) {
        Node<T> newNode = new Node<>(data);
        if (head == null) {
            head = newNode; // list was empty, new node becomes head
        } else {
            Node<T> current = head;
            while (current.next != null) { // walk to the last node
                current = current.next;
            }
            current.next = newNode; // attach new node at the end
        }
        size++;
    }

    // Retrieves the value at a given index by walking from head.
    // O(n) — no direct memory indexing like an array has.
    public T get(int index) {
        if (index < 0 || index >= size) {
            throw new IndexOutOfBoundsException("Index: " + index);
        }
        Node<T> current = head;
        for (int i = 0; i < index; i++) {
            current = current.next; // walk forward 'index' times
        }
        return current.data;
    }

    // Removes the first node matching the given value.
    public boolean remove(T data) {
        if (head == null) return false;

        if (head.data.equals(data)) { // special case: removing the head itself
            head = head.next;
            size--;
            return true;
        }

        Node<T> current = head;
        while (current.next != null) {
            if (current.next.data.equals(data)) {
                current.next = current.next.next; // skip over the node being removed
                size--;
                return true;
            }
            current = current.next;
        }
        return false; // not found
    }

    public int size() {
        return size;
    }

    public boolean isEmpty() {
        return size == 0;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder("[");
        Node<T> current = head;
        while (current != null) {
            sb.append(current.data);
            if (current.next != null) sb.append(", ");
            current = current.next;
        }
        sb.append("]");
        return sb.toString();
    }
}