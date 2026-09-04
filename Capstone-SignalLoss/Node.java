import java.util.ArrayList;
import java.util.List;

public class Node {
    public enum Type {
        START, NORMAL, BOOST, CORRUPT, TELEPORT, FLIP, EXIT
    }

    private final int id;
    private final int x;
    private final int y;
    private final Type type;
    private final List<Node> connections;
    
    private boolean active;
    private Node teleportTarget;
    
    // Phase 4 additions: Flipping node state
    private int flipInterval;

    public Node(int id, int x, int y, Type type) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.type = type;
        this.connections = new ArrayList<>();
        this.active = true;
        this.teleportTarget = null;
        this.flipInterval = 2; // Default flip interval is every 2 steps
    }

    public int getId() { return id; }
    public int getX() { return x; }
    public int getY() { return y; }
    public Type getType() { return type; }
    public List<Node> getConnections() { return connections; }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Node getTeleportTarget() {
        return teleportTarget;
    }

    public void setTeleportTarget(Node teleportTarget) {
        this.teleportTarget = teleportTarget;
    }

    public int getFlipInterval() {
        return flipInterval;
    }

    public void setFlipInterval(int flipInterval) {
        this.flipInterval = flipInterval;
    }

    public void addConnection(Node other) {
        if (!connections.contains(other)) {
            connections.add(other);
            other.connections.add(this); // Bidirectional connection
        }
    }
}
