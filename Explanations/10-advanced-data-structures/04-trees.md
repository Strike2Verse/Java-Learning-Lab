# Trees (Binary Tree, BST)

A tree is a hierarchical structure — unlike lists (linear), a tree
branches, with each node potentially having multiple children. A binary
tree specifically means each node has at most 2 children, conventionally
called `left` and `right`.

## The building block: a TreeNode

```java
class TreeNode<T> {
    T data;
    TreeNode<T> left;
    TreeNode<T> right;

    TreeNode(T data) {
        this.data = data;
        this.left = null;
        this.right = null;
    }
}
```

## What makes a Binary Search Tree (BST) special

A BST follows one rule at every node: everything in the left subtree is
smaller, everything in the right subtree is larger. This ordering is what
makes searching fast.

```java
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
    return node;
}
```

This uses recursion — each call handles one node and delegates to itself
for the subtree, until it finds the right empty spot.

## Searching in a BST

```java
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
```

At each step, roughly half the remaining tree is eliminated — this is why
BST search is typically `O(log n)`, much faster than a linked list's
`O(n)`. This assumes a reasonably **balanced** tree — inserting
already-sorted data (1, 2, 3, 4, 5...) degenerates a BST into essentially
a linked list, back to `O(n)`. Self-balancing trees (like Red-Black
Trees, which Java's `TreeMap`/`TreeSet` actually use internally) solve
this in practice.

## Traversing a tree: in-order (gives sorted output!)

```java
private void inOrderRec(TreeNode<Integer> node) {
    if (node == null) return;
    inOrderRec(node.left);            // visit left subtree first
    System.out.print(node.data + " "); // then this node
    inOrderRec(node.right);           // then right subtree
}
```

For a BST specifically, in-order traversal always visits nodes in sorted
ascending order — a direct consequence of the BST rule (left < node <
right combined with the Left→Node→Right visit order).

## Other traversal orders

- **Pre-order**: node → left → right (useful for copying a tree)
- **Post-order**: left → right → node (useful for deleting a tree safely)

## Practice Program

See:
- [`TreeNode.java`](../../Code/10-advanced-data-structures/04-trees/TreeNode.java) — the building-block class
- [`BST.java`](../../Code/10-advanced-data-structures/04-trees/BST.java) — insert, contains, and all three traversal orders
- [`TreesDemo.java`](../../Code/10-advanced-data-structures/04-trees/TreesDemo.java) —
  a runnable example inserting values, searching, and printing all three
  traversal orders

### Compiling and running

```bash
cd Code/10-advanced-data-structures/04-trees
javac TreesDemo.java TreeNode.java BST.java
java TreesDemo
```