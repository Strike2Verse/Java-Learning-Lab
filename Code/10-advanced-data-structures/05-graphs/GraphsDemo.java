public class GraphsDemo {
    public static void main(String[] args) {

        Graph graph = new Graph();

        // Build a small social-network-like graph:
        //
        //     A --- B --- D
        //     |     |
        //     C --- E
        //
        graph.addVertex("A");
        graph.addVertex("B");
        graph.addVertex("C");
        graph.addVertex("D");
        graph.addVertex("E");

        graph.addEdge("A", "B");
        graph.addEdge("A", "C");
        graph.addEdge("B", "D");
        graph.addEdge("B", "E");
        graph.addEdge("C", "E");

        System.out.print("BFS from A (level by level): ");
        graph.bfs("A"); // A B C D E (order may vary slightly by list order)

        System.out.print("DFS from A (deep first, then backtrack): ");
        graph.dfs("A"); // A B D E C (order may vary slightly by list order)

        System.out.println("--------------------");

        // Demonstrate that the graph has a cycle (A-B-E-C-A), and that
        // visited tracking correctly prevents infinite looping.
        System.out.println("Graph contains a cycle: A -> B -> E -> C -> A");
        System.out.println("Both BFS and DFS above completed without looping forever,");
        System.out.println("thanks to the visited set tracking already-seen nodes.");
    }
}