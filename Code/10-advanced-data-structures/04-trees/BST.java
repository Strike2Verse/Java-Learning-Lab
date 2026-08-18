public class BST {
    private TreeNode<Integer> root;

    public void insert(int value) {
        root = insertRec(root, value);
    }

    private TreeNode<Integer> insertRec(TreeNode<Integer> node, int value) {
        if (node == null) {
            return new TreeNode<>(value); // found the empty spot, place it here
        }
        if (value < node.data) {
            node.left = insertRec(node.left, value);  // smaller — go left
        } else if (value > node.data) {
            node.right = insertRec(node.right, value); // larger — go right
        }
        // equal values ignored (no duplicates in this basic implementation)
        return node;
    }

    public boolean contains(int value) {
        return containsRec(root, value);
    }

    private boolean containsRec(TreeNode<Integer> node, int value) {
        if (node == null) return false;         // reached an empty spot — not found
        if (value == node.data) return true;     // found it
        return value < node.data
            ? containsRec(node.left, value)      // smaller — search left
            : containsRec(node.right, value);    // larger — search right
    }

    // In-order: Left -> Node -> Right. Always sorted ascending for a BST.
    public void inOrder() {
        inOrderRec(root);
        System.out.println();
    }

    private void inOrderRec(TreeNode<Integer> node) {
        if (node == null) return;
        inOrderRec(node.left);
        System.out.print(node.data + " ");
        inOrderRec(node.right);
    }

    // Pre-order: Node -> Left -> Right. Useful for copying a tree.
    public void preOrder() {
        preOrderRec(root);
        System.out.println();
    }

    private void preOrderRec(TreeNode<Integer> node) {
        if (node == null) return;
        System.out.print(node.data + " ");
        preOrderRec(node.left);
        preOrderRec(node.right);
    }

    // Post-order: Left -> Right -> Node. Useful for deleting a tree safely.
    public void postOrder() {
        postOrderRec(root);
        System.out.println();
    }

    private void postOrderRec(TreeNode<Integer> node) {
        if (node == null) return;
        postOrderRec(node.left);
        postOrderRec(node.right);
        System.out.print(node.data + " ");
    }
}