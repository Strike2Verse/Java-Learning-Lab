# Graphs

The most general structure covered — trees are actually a special type
of graph.

## What a graph is

A graph is a set of nodes (vertices) connected by edges. Unlike trees,
graphs have no fixed hierarchy — any node can connect to any other node,
and there's no single "root."

## Types of graphs

- **Directed** — edges have a direction (A → B doesn't imply B → A).
  Think: Twitter follows.
- **Undirected** — edges go both ways. Think: Facebook friends.
- **Weighted** — edges have a "cost" (e.g., distance, time). Think: roads
  on a map.
- **Unweighted** — edges just represent a connection, nothing more.

This covers a simple undirected, unweighted graph.

## Representing a graph: adjacency list

The most common representation — each node maps to a list of its
neighbors.

```java
import java.util.*;

public class Graph {
    private Map<String, List<String>> adjList = new HashMap<>();

    public void addVertex(String vertex) {
        adjList.putIfAbsent(vertex, new ArrayList<>());
    }

    public void addEdge(String vertex1, String vertex2) {
        adjList.get(vertex1).add(vertex2);
        adjList.get(vertex2).add(vertex1); // undirected — add both directions
    }
}
```

## Breadth-First Search (BFS) — explore level by level

Uses a `Queue` to visit the closest nodes first. The FIFO order means all
nodes at the current distance level are processed — and have their
neighbors queued — before any of those neighbors are processed
themselves, producing level-by-level exploration.

```java
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
}
```

## Depth-First Search (DFS) — explore as deep as possible first

Uses a stack (or recursion, which uses the call stack implicitly) — dives
deep down one path before backtracking.

```java
public void dfs(String start) {
    Set<String> visited = new HashSet<>();
    dfsRec(start, visited);
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
```

## BFS vs DFS — when to use which

- **BFS** — finding the shortest path (fewest edges) between two nodes.
  Guaranteed shortest on unweighted graphs, since the first time the
  target is reached is necessarily via the shortest route.
- **DFS** — exploring all possibilities (e.g., maze solving), detecting
  cycles, topological sorting.

## Why visited tracking is essential

Unlike trees (acyclic by definition), graphs can have cycles — a path can
loop back on itself. Without tracking visited nodes, BFS/DFS could loop
forever.

## Practice Program

See:
- [`Graph.java`](../../Code/10-advanced-data-structures/05-graphs/Graph.java) — adjacency list, BFS, and DFS
- [`GraphsDemo.java`](../../Code/10-advanced-data-structures/05-graphs/GraphsDemo.java) —
  a runnable example building a small graph (including a cycle) and
  running both BFS and DFS from it

### Compiling and running

```bash
cd Code/10-advanced-data-structures/05-graphs
javac GraphsDemo.java Graph.java
java GraphsDemo
```