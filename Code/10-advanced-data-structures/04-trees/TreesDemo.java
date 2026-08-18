public class TreesDemo {
    public static void main(String[] args) {

        BST tree = new BST();

        // ---- inserting values (recursively placed left/right) ----
        int[] values = { 50, 30, 70, 20, 40, 60, 80 };
        for (int v : values) {
            tree.insert(v);
        }
        System.out.println("Inserted: 50, 30, 70, 20, 40, 60, 80");

        System.out.println("--------------------");

        // ---- searching ----
        System.out.println("contains(40): " + tree.contains(40)); // true
        System.out.println("contains(90): " + tree.contains(90)); // false

        System.out.println("--------------------");

        // ---- traversals ----
        System.out.print("In-order (sorted ascending): ");
        tree.inOrder(); // 20 30 40 50 60 70 80

        System.out.print("Pre-order (node, left, right): ");
        tree.preOrder(); // 50 30 20 40 70 60 80

        System.out.print("Post-order (left, right, node): ");
        tree.postOrder(); // 20 40 30 60 80 70 50
    }
}