public class Packet {
    private Node currentNode;
    private int signalStrength;
    private int stepsTaken;
    private boolean reachedExit;
    private boolean deadlocked;
    private final int maxStartingSignal;

    public Packet(Node startNode) {
        this(startNode, 100);
    }

    public Packet(Node startNode, int startingSignal) {
        this.currentNode = startNode;
        this.signalStrength = startingSignal;
        this.maxStartingSignal = startingSignal;
        this.stepsTaken = 0;
        this.reachedExit = false;
        this.deadlocked = false;
    }

    public Node getCurrentNode() {
        return currentNode;
    }

    public int getSignalStrength() {
        return signalStrength;
    }

    public int getStepsTaken() {
        return stepsTaken;
    }

    public boolean isReachedExit() {
        return reachedExit;
    }

    public int getMaxStartingSignal() {
        return maxStartingSignal;
    }

    public boolean isDeadlocked() {
        return deadlocked;
    }

    public void setDeadlocked(boolean deadlocked) {
        this.deadlocked = deadlocked;
    }

    public boolean isDead() {
        return (signalStrength <= 0 || deadlocked) && !reachedExit;
    }

    public void modifySignal(int amount) {
        signalStrength += amount;
        if (signalStrength > maxStartingSignal) signalStrength = maxStartingSignal;
        if (signalStrength < 0) signalStrength = 0;
    }

    public boolean moveTo(Node targetNode) {
        if (isDead() || reachedExit) {
            return false;
        }

        // Validate the target is connected to our current node
        if (currentNode.getConnections().contains(targetNode)) {
            // Block movement if target is a FLIP node that is currently offline/inactive
            if (targetNode.getType() == Node.Type.FLIP && !targetNode.isActive()) {
                SoundManager.playDamage();
                return false;
            }

            currentNode = targetNode;
            stepsTaken++;
            
            // Standard decay step: -10 signal strength per node transition
            modifySignal(-10);

            // Apply node-specific effects and trigger sounds
            applyNodeEffects();

            if (currentNode.getType() == Node.Type.EXIT) {
                reachedExit = true;
                SoundManager.playWin();
            } else if (isDead()) {
                SoundManager.playLose();
            }
            return true;
        }
        return false;
    }

    private void applyNodeEffects() {
        switch (currentNode.getType()) {
            case BOOST:
                if (currentNode.isActive()) {
                    modifySignal(20); // Boost recovers 20% signal
                    currentNode.setActive(false); // Consume the boost node
                    SoundManager.playBoost();
                } else {
                    SoundManager.playMove();
                }
                break;
                
            case CORRUPT:
                modifySignal(-15); // Corrupt nodes drain an extra 15% signal
                SoundManager.playDamage();
                break;
                
            case TELEPORT:
                Node target = currentNode.getTeleportTarget();
                if (target != null) {
                    currentNode = target;
                    SoundManager.playTeleport();
                } else {
                    SoundManager.playMove();
                }
                break;
                
            case START:
            case NORMAL:
            case FLIP:
                SoundManager.playMove();
                break;
                
            default:
                break;
        }
    }
}
