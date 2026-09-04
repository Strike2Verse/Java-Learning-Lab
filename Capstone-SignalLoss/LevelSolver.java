import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Queue;

public class LevelSolver {

    public static class SearchState {
        public final Node node;
        public final int steps;
        public final int signal;
        public final long consumedBoostsMask;
        public final SearchState parent;

        public SearchState(Node node, int steps, int signal, long consumedBoostsMask, SearchState parent) {
            this.node = node;
            this.steps = steps;
            this.signal = signal;
            this.consumedBoostsMask = consumedBoostsMask;
            this.parent = parent;
        }

        public String getVisitedKey() {
            // Key captures node, steps (modulo 4 because flip intervals are 2), and consumed boosts
            return node.getId() + "_" + (steps % 4) + "_" + consumedBoostsMask;
        }
    }

    /**
     * Finds a valid path from START to EXIT.
     * Returns the sequence of nodes representing the path, or null if unsolvable.
     */
    public static List<Node> solve(List<Node> nodes) {
        Node startNode = null;
        for (Node n : nodes) {
            if (n.getType() == Node.Type.START) {
                startNode = n;
                break;
            }
        }
        if (startNode == null) return null;

        Queue<SearchState> queue = new LinkedList<>();
        Map<String, Integer> visited = new HashMap<>(); // Maps state key to max signal strength seen

        // Initial state
        SearchState initialState = new SearchState(startNode, 0, 100, 0L, null);
        queue.add(initialState);
        visited.put(initialState.getVisitedKey(), 100);

        SearchState winningState = null;

        while (!queue.isEmpty()) {
            SearchState current = queue.poll();

            if (current.node.getType() == Node.Type.EXIT) {
                winningState = current;
                break; // Found shortest valid path
            }

            // Explore all connections
            for (Node neighbor : current.node.getConnections()) {
                int nextSteps = current.steps + 1;
                
                // Determine if neighbor is a FLIP node and what its state will be on entry
                boolean isFlip = neighbor.getType() == Node.Type.FLIP;
                boolean isOnline = (nextSteps / neighbor.getFlipInterval()) % 2 == 0;
                
                if (isFlip && !isOnline) {
                    continue; // Path is blocked by offline flipping node
                }

                int nextSignal = current.signal - 10; // Standard step decay
                long nextBoostsMask = current.consumedBoostsMask;

                // Apply node effects
                if (neighbor.getType() == Node.Type.BOOST) {
                    long bit = 1L << neighbor.getId();
                    boolean alreadyUsed = (nextBoostsMask & bit) != 0;
                    if (!alreadyUsed) {
                        nextSignal += 20; // Reclaim signal
                        nextBoostsMask |= bit; // Mark as consumed
                    }
                } else if (neighbor.getType() == Node.Type.CORRUPT) {
                    nextSignal -= 15; // Extra corruption damage
                }

                if (nextSignal > 100) nextSignal = 100;

                // Check if packet dead
                if (nextSignal <= 0) {
                    continue; // Skip dead paths
                }

                Node finalNeighbor = neighbor;
                // Handle instant teleport jump
                if (neighbor.getType() == Node.Type.TELEPORT && neighbor.getTeleportTarget() != null) {
                    finalNeighbor = neighbor.getTeleportTarget();
                    // Teleport does not cost additional steps or decay, it inherits neighbor states
                }

                SearchState nextState = new SearchState(finalNeighbor, nextSteps, nextSignal, nextBoostsMask, current);
                String key = nextState.getVisitedKey();

                // If we haven't visited this state, or found a way to reach it with higher signal, explore it
                if (!visited.containsKey(key) || visited.get(key) < nextSignal) {
                    visited.put(key, nextSignal);
                    queue.add(nextState);
                }
            }
        }

        if (winningState == null) {
            return null; // Unsolvable
        }

        // Reconstruct the path
        List<Node> path = new ArrayList<>();
        SearchState curr = winningState;
        while (curr != null) {
            path.add(0, curr.node);
            curr = curr.parent;
        }
        return path;
    }
}
