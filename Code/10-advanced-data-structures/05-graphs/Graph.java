import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.Set;

public class Graph {
    private Map<String, List<String>> adjList = new HashMap<>();

    public void addVertex(String vertex) {
        adjList.putIfAbsent(vertex, new ArrayList<>());
    }

    public void addEdge(String vertex1, String vertex2) {
        adjList.get(vertex1).add(vertex2);
        adjList.get(vertex2).add(vertex1); // undirected — add both directions
    }

    // Breadth-First Search — explores level by level using a Queue.
    // The FIFO order guarantees all closer nodes are visited before
    // farther ones, which is why BFS finds the shortest unweighted path.
    public void bfs(String start) {
        Set<String> visited = new HashSet<>();
        Queue<String> queue = new LinkedList<>();

        queue.offer(start);
        visited.add(start);

        while (!queue.isEmpty()) {
            String current = queue.poll();
            System.out.print(current + " ");

            for (String neighbor : adjList.get(current)) {
                if (!visited.contains(neighbor)) {
                    visited.add(neighbor);
                    queue.offer(neighbor);
                }
            }
        }
        System.out.println();
    }

    // Depth-First Search — dives deep down one path before backtracking.
    // Uses recursion (the call stack acts as the implicit stack).
    public void dfs(String start) {
        Set<String> visited = new HashSet<>();
        dfsRec(start, visited);
        System.out.println();
    }

    private void dfsRec(String current, Set<String> visited) {
        visited.add(current);
        System.out.print(current + " ");

        for (String neighbor : adjList.get(current)) {
            if (!visited.contains(neighbor)) {
                dfsRec(neighbor, visited);
            }
        }
    }
}